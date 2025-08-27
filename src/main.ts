import { APISocket } from 'airdcpp-apisocket';

import SettingsManager from 'airdcpp-extension-settings';
import { ExtensionEntryData } from 'airdcpp-extension';

import { HubMessageCollectorMode, PrivateChatCollectorMode, SettingDefinitions } from './settings';

import { MessageCollector } from './messages';
import { NodeMailer } from './transport';

import { Context } from './types';
import { API } from './api';

const CONFIG_VERSION = 1;

export default function init(socket: APISocket, extension: ExtensionEntryData) {
  const settings = SettingsManager(socket, {
    extensionName: extension.name,
    configFile: extension.configPath + 'config.json',
    configVersion: CONFIG_VERSION,
    definitions: SettingDefinitions,
  });

  const context: Context = {
    api: API(socket),
    logger: socket.logger,
    getExtSetting: settings.getValue,
    extension,
  };

  const transporter = NodeMailer(context);
  const messageCollector = MessageCollector(transporter, context);

  const isSmtpSetting = (key: string) => key.indexOf('smtp_') === 0;

  extension.onStart = async (sessionInfo: any) => {
    const hostname = sessionInfo.system_info.hostname;
    settings.onValuesUpdated = (updatedValues: Record<string, unknown>) => {
      if (Object.keys(updatedValues).find(isSmtpSetting)) {
        transporter.reset(hostname);
      }
    };

    await settings.load();
    socket.logger.verbose('Settings were loaded');

    if (settings.getValue('hub_message_mode') != HubMessageCollectorMode.DISABLED) {
      socket.addListener('hubs', 'hub_message', messageCollector.onHubMessage);
    }

    if (settings.getValue('private_chat_message_mode') != PrivateChatCollectorMode.DISABLED) {
      socket.addListener('private_chat', 'private_chat_message', messageCollector.onPrivateMessage);
    }
  };

  extension.onStop = () => {
    messageCollector.stop();
  };
}
