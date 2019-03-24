'use strict';

import nodemailer from 'nodemailer';

import MessageBuilder from './MessageBuilder';
import SessionTypes from './SessionTypes';

import { DEFAULT_TO, SettingDefinitions } from './SettingDefinitions';
const CONFIG_VERSION = 1;

const SettingsManager = require('airdcpp-extension-settings');

export default function (socket, extension) {
	const settings = SettingsManager(socket, {
		extensionName: extension.name, 
		configFile: extension.configPath + 'config.json',
		configVersion: CONFIG_VERSION,
		definitions: SettingDefinitions,
	});

	let transporter;
	let flushTimeout;
	let hostname;

	const cache = {
		privateMessages: {},
		hubMessages: {},
	};

	const hasConfig = () => settings.getValue('to') !== DEFAULT_TO;

	const constructSmtpSettings = () => {
		const ret = {
			host: settings.getValue('smtp_host'),
			port: settings.getValue('smtp_port'),
			secure: settings.getValue('smtp_secure'),
		}

		const user = settings.getValue('smtp_user');
		const pass = settings.getValue('smtp_password');
		if (user && pass) {
			ret['auth'] = {
				user,
				pass,
			}
		}

		return ret;
	};

	const constructMail = (text) => {
		return {
				from: settings.getValue('from'),
				to: settings.getValue('to'),
				subject: `Chat summary from AirDC++ (${hostname})`,
				text,
		};
	};

	const privateChatInfoGetter = sessionId => socket.get(`private_chat/${sessionId}`);
	const hubInfoGetter = sessionId => socket.get(`hubs/${sessionId}`);

	// Send cached messages (if there are any)
	const flushCache = async () => {
		socket.logger.verbose('Flushing cache...');
		let messageSummary = '';
		messageSummary += await MessageBuilder.constructSummary(SessionTypes.privateChat, cache.privateMessages, privateChatInfoGetter);
		messageSummary += await MessageBuilder.constructSummary(SessionTypes.hub, cache.hubMessages, hubInfoGetter);

		if (messageSummary) {
			transporter.sendMail(constructMail(messageSummary), (error, info) => {
				if (error) {
					socket.logger.error(`Failed to send email: ${error}`);
					socket.post('events', {
						text: `${extension.name}: failed to email message summary (see the extension error log for more information)`,
						severity: 'error',
					});
				} else {
					socket.logger.info(`Message ${info.messageId} sent: ${info.response}`);
				}
			});
		} else {
			socket.logger.verbose('Nothing to send');
		}

		cache.privateMessages = {};
		cache.hubMessages = {};
		flushTimeout = undefined;
	};

	const onIncomingMessage = (cacheKey, message, sessionId) => {
		if (!hasConfig() || !settings.getValue('flush_interval')) {
			socket.logger.verbose('Caching disabled due to current configuration');
			return;
		}
		
		const sessionCache = cache[cacheKey];
		sessionCache[sessionId] = sessionCache[sessionId] || [];
		sessionCache[sessionId].push(message);

		if (!flushTimeout) {
			const flushMs = settings.getValue('flush_interval') * 60 * 1000;
			socket.logger.verbose('Scheduling flush', flushMs);
			flushTimeout = setTimeout(flushCache, flushMs);
		}
	};

	const isSmtpSetting = key => key.indexOf('smtp_') === 0;

	extension.onStart = async (sessionInfo) => {
		hostname = sessionInfo.system_info.hostname;
		settings.onValuesUpdated = updatedValues => {
			if (Object.keys(updatedValues).find(isSmtpSetting)) {
				socket.logger.verbose('Creating mailer interface');
				try {
					transporter = nodemailer.createTransport(constructSmtpSettings());
				} catch (e) {
					socket.logger.error(`Failed to initialize mailer interface: ${e}`);
					process.exit(1);
				}

				if (hasConfig()) {
					transporter.verify((error, success) => {
						socket.logger.verbose('Verifying settings');
						if (error) {
							socket.post('events', {
								text: `${extension.name}: SMTP setting validation failed (${error})`,
								severity: 'error',
							});
						} else {
							socket.logger.verbose('Setting validation succeeded');
							/*socket.post('events', {
								text: `${extension.name}: SMTP settings were validated successfully`,
								severity: 'info',
							});*/
						}
					});
				}
			}
		};

		await settings.load();
		socket.logger.verbose('Settings were loaded');

		if (settings.getValue('send_hub_logs')) {
			socket.addListener('hubs', 'hub_message', onIncomingMessage.bind(this, 'hubMessages'));
		}

		if (settings.getValue('send_private_logs')) {
			socket.addListener('private_chat', 'private_chat_message', onIncomingMessage.bind(this, 'privateMessages'));
		}
	};

	extension.onStop = () => {
		clearTimeout(flushTimeout);
	};
};