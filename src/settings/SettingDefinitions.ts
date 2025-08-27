export const DEFAULT_TO = 'disabled@example.com';

export enum HubMessageCollectorMode {
  DISABLED = 'disabled',
  MENTIONS_ONLY = 'mentions_only',
  MENTIONS_USERS_NOTIFY_ONLY = 'users_notify',
  USERS_ONLY = 'users_all',
  ALL = 'all',
}

export enum PrivateChatCollectorMode {
  DISABLED = 'disabled',
  FAVORITE_USERS = 'users_favorite',
  USERS_CHATROOM_MENTIONS = 'users_chatroom_mentions',
  USERS_CHATROOMS = 'users_chatrooms_full',
  ALL = 'all',
}

// Priorities (higher number = more restrictive)
export const HubMessageModePriority = {
  [HubMessageCollectorMode.DISABLED]: 40,
  [HubMessageCollectorMode.MENTIONS_ONLY]: 30,
  [HubMessageCollectorMode.MENTIONS_USERS_NOTIFY_ONLY]: 20,
  [HubMessageCollectorMode.USERS_ONLY]: 10,
  [HubMessageCollectorMode.ALL]: 0,
};

export const PrivateChatModePriority = {
  [PrivateChatCollectorMode.DISABLED]: 40,
  [PrivateChatCollectorMode.FAVORITE_USERS]: 30,
  [PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS]: 20,
  [PrivateChatCollectorMode.USERS_CHATROOMS]: 10,
  [PrivateChatCollectorMode.ALL]: 0,
};

export type SettingDefinition = {
  key: string;
  title: string;
  default_value?: string | number | boolean;
  optional?: boolean;
  type: 'boolean' | 'number' | 'string' | 'password' | 'email';
  help?: string;
  options?: { id: string; name: string }[];
};

export const SettingDefinitions: SettingDefinition[] = [
  {
    key: 'hub_message_mode',
    title: 'Email hub message logs',
    default_value: HubMessageCollectorMode.MENTIONS_USERS_NOTIFY_ONLY,
    type: 'string',
    help: 'Extension must be restarted for the changes to take effect',
    options: [
      {
        id: HubMessageCollectorMode.DISABLED,
        name: 'Disabled'
      }, {
        id: HubMessageCollectorMode.MENTIONS_ONLY,
        name: 'Mentions only',
      }, {
        id: HubMessageCollectorMode.MENTIONS_USERS_NOTIFY_ONLY,
        name: 'All mentions, all user messages in hubs with chat notification enabled',
      },{
        id: HubMessageCollectorMode.USERS_ONLY,
        name: 'All user messages',
      }, {
        id: HubMessageCollectorMode.ALL,
        name: 'All messages (including bots)'
      }
    ]
  }, 
  {
    key: 'private_chat_message_mode',
    title: 'Email private message message logs',
    default_value: PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS,
    type: 'string',
    help: 'Extension must be restarted for the changes to take effect',
    options: [
      {
        id: PrivateChatCollectorMode.DISABLED,
        name: 'Disabled',
      }, {
        id: PrivateChatCollectorMode.FAVORITE_USERS,
        name: 'Direct messages from favorite users only',
      }, {
        id: PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS,
        name: 'Direct user messages and chatroom mentions only',
      }, {
        id: PrivateChatCollectorMode.USERS_CHATROOMS,
        name: 'Direct user messages and all chatroom messages',
      }, {
        id: PrivateChatCollectorMode.ALL,
        name: 'All messages (including bots)'
      }
    ]
  }, {
    key: 'flush_interval',
    title: 'Message summary send interval (minutes)',
    default_value: 15,
    type: 'number'
  }, {
    key: 'from',
    title: 'Sender',
    default_value: '"AirDC++" <example@example.com>',
    type: 'string'
  }, {
    key: 'to',
    title: 'Recipient(s)',
    default_value: DEFAULT_TO,
    type: 'string',
    help: 'You may add multiple addresses separated with commas'
  }, {
    key: 'smtp_host',
    title: 'SMTP server address',
    default_value: 'localhost',
    type: 'string'
  }, {
    key: 'smtp_port',
    title: 'SMTP server port',
    default_value: 25,
    type: 'number',
    help: "If you are running the application on home connection, it's often easiest to use the SMTP server of your internet provider"
  }, {
    key: 'smtp_secure',
    title: 'Enable SMTP SSL encryption',
    default_value: false,
    type: 'boolean'
  }, {
    key: 'smtp_user',
    title: 'SMTP user',
    optional: true,
    type: 'string'
  }, {
    key: 'smtp_password',
    title: 'SMTP password',
    optional: true,
    type: 'password'
  }
];
