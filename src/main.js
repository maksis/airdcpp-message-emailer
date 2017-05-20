'use strict';

import nodemailer from 'nodemailer';

import MessageBuilder from './MessageBuilder';
import SessionTypes from './SessionTypes';

import { DEFAULT_TO, SettingDefinitions } from './SettingDefinitions';
const CONFIG_VERSION = 1;

const SettingsManager = require('airdcpp-extension-settings');

module.exports = function (socket, extension) {
	const settings = SettingsManager(socket, {
		extensionName: extension.name, 
		configFile: extension.configPath + 'config.json',
		configVersion: CONFIG_VERSION,
		definitions: SettingDefinitions,
	});

	let transporter;
	let flushTimeout;
	let hostname;

	let privateMessages = {};
	let hubMessages = {};

	const hasConfig = () => settings.getValue('to') !== DEFAULT_TO;

	const constructSmtpSettings = () => {
		const ret = {
			host: settings.getValue('smtp_host'),
			port: settings.getValue('smtp_port'),
			secure: settings.getValue('smtp_secure'),
		}

		const user = settings.getValue('smtp_user');
		const password = settings.getValue('smtp_password');
		if (user && password) {
			ret['auth'] = {
				user,
				password,
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
		let messageSummary = '';
		messageSummary += await MessageBuilder.constructSummary(SessionTypes.privateChat, privateMessages, privateChatInfoGetter);
		messageSummary += await MessageBuilder.constructSummary(SessionTypes.hub, hubMessages, hubInfoGetter);

		if (messageSummary) {
			transporter.sendMail(constructMail(messageSummary), (error, info) => {
				if (error) {
					socket.logger.error(error);
				}

				socket.logger.info('Message %s sent: %s', info.messageId, info.response);
			});
		}

		privateMessages = {};
		hubMessages = {};
		flushTimeout = undefined;
	};

	const onIncomingMessage = (messageCache, message, sessionId) => {
		if (!hasConfig() || !settings.getValue('flush_interval')) {
			return;
		}
		
		messageCache[sessionId] = messageCache[sessionId] || [];
		messageCache[sessionId].push(message);

		if (!flushTimeout) {
			flushTimeout = setTimeout(flushCache, settings.getValue('flush_interval') * 60 * 1000);
		}
	};

	const isSmtpSetting = key => key.indexOf('smtp_') === 0;

	extension.onStart = async (sessionInfo) => {
		hostname = sessionInfo.system_info.hostname;
		settings.onValuesUpdated = updatedValues => {
			if (Object.keys(updatedValues).find(isSmtpSetting)) {
				transporter = nodemailer.createTransport(constructSmtpSettings());
				if (hasConfig()) {
					transporter.verify((error, success) => {
						if (error) {
							socket.post('events', {
								text: `${extension.name}: SMTP setting validation failed (${error})`,
								severity: 'error',
							});
						} /*else {
							socket.post('events', {
								text: `${extension.name}: SMTP settings were validated successfully`,
								severity: 'info',
							});
						}*/
					});
				}
			}
		};

		await settings.load();

		if (settings.getValue('send_hub_logs')) {
			socket.addListener('hubs', 'hub_message', onIncomingMessage.bind(this, hubMessages));
		}

		if (settings.getValue('send_private_logs')) {
			socket.addListener('private_chat', 'private_chat_message', onIncomingMessage.bind(this, privateMessages));
		}
	};

	extension.onStop = () => {
		clearTimeout(flushTimeout);
	};
};