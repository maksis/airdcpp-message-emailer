import nodemailer from 'nodemailer';
import MessageBuilder from './MessageBuilder';
import SessionTypes from './SessionTypes';
import { DEFAULT_TO, SettingDefinitions } from './SettingDefinitions';
import { Message, MessageCache, SessionId, SessionInfoGetter, SessionNameGetter, SessionType } from './types';

const CONFIG_VERSION = 1;

import SettingsManager from 'airdcpp-extension-settings';

type Socket = any;

type Extension = {
  name: string;
  configPath: string;
  onStart?: (sessionInfo: any) => Promise<void> | void;
  onStop?: () => void;
};

export default function init(socket: Socket, extension: Extension) {
  const settings = SettingsManager(socket, {
    extensionName: extension.name,
    configFile: extension.configPath + 'config.json',
    configVersion: CONFIG_VERSION,
    definitions: SettingDefinitions,
  });

  let transporter: nodemailer.Transporter | undefined;
  let flushTimeout: NodeJS.Timeout | undefined;
  let hostname: string;

  const cache = {
    privateMessages: {} as MessageCache,
    hubMessages: {} as MessageCache,
  };

  const hasConfig = () => settings.getValue('to') !== DEFAULT_TO;

  const constructSmtpSettings = () => {
    const ret = {
      host: settings.getValue('smtp_host'),
      port: settings.getValue('smtp_port'),
      secure: settings.getValue('smtp_secure'),
    };

    const user = settings.getValue('smtp_user');
    const pass = settings.getValue('smtp_password');
    if (user && pass) {
      ret['auth'] = {
        user,
        pass,
      };
    }

    return ret;
  };

  const constructMail = (text: string) => {
    const mailOptions: nodemailer.SendMailOptions = {
      from: settings.getValue('from'),
      to: settings.getValue('to'),
      subject: `Chat summary from AirDC++ (${hostname})`,
      text,
    };

    return mailOptions;
  };

  const privateChatInfoGetter: SessionInfoGetter = (sessionId) => socket.get(`private_chat/${sessionId}`);
  const hubInfoGetter: SessionInfoGetter = (sessionId) => socket.get(`hubs/${sessionId}`);

  // Send cached messages (if there are any)
  const flushCache = async () => {
    socket.logger.verbose('Flushing cache...');
    let messageSummary = '';
    messageSummary += await MessageBuilder.constructSummary(SessionTypes.privateChat, cache.privateMessages, privateChatInfoGetter);
    messageSummary += await MessageBuilder.constructSummary(SessionTypes.hub, cache.hubMessages, hubInfoGetter);

    if (messageSummary) {
      transporter!.sendMail(constructMail(messageSummary), (error: any, info: any) => {
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

  const onIncomingMessage = (cacheKey: keyof SessionType, message: Message, sessionId: SessionId) => {
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

  const resetMailer = () => {
    socket.logger.verbose('Creating mailer interface');
    try {
      transporter = nodemailer.createTransport(constructSmtpSettings());
    } catch (e) {
      socket.logger.error(`Failed to initialize mailer interface: ${e}`);
      process.exit(1);
    }

    if (hasConfig()) {
      transporter.verify((error: any, _success: boolean) => {
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

  const isSmtpSetting = (key: string) => key.indexOf('smtp_') === 0;

  extension.onStart = async (sessionInfo: any) => {
    hostname = sessionInfo.system_info.hostname;
    settings.onValuesUpdated = (updatedValues: Record<string, unknown>) => {
      if (Object.keys(updatedValues).find(isSmtpSetting)) {
        resetMailer();
      }
    };

    await settings.load();
    socket.logger.verbose('Settings were loaded');

    if (settings.getValue('send_hub_logs')) {
      socket.addListener('hubs', 'hub_message', onIncomingMessage.bind(undefined, 'hubMessages'));
    }

    if (settings.getValue('send_private_logs')) {
      socket.addListener('private_chat', 'private_chat_message', onIncomingMessage.bind(undefined, 'privateMessages'));
    }
  };

  extension.onStop = () => {
    clearTimeout(flushTimeout);
  };
}
