export const enum SeverityEnum {
  NOTIFY = 'notify',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

// USERS
export type UserFlag =
  | 'self'
  | 'bot'
  | 'asch'
  | 'ccpm'
  | 'ignored'
  | 'favorite'
  | 'nmdc'
  | 'offline'
  | 'op';

export type HubUserFlag = UserFlag | 'away' | 'op' | 'hidden' | 'noconnect' | 'passive';

export type UserBase = {
  cid: string;
  flags: UserFlag[];
};

export type HintedUser = UserBase & {
  nicks: string;
};

export type HubUser = UserBase & {
  nick: string;
};

// MESSAGES
export type ChatMessage = {
  id: number;
  from: HubUser;
  reply_to?: HubUser;
  text: string;
  time: number; // seconds epoch
  has_mention: boolean;
};

// SESSIONS
export type SessionId = string | number;

export interface UnreadChatMessageCounts {
  user: number;
  bot: number;
}

export interface ChatMessageCounts {
  unread: UnreadChatMessageCounts;
}

export type SessionBase = {
  message_counts: ChatMessageCounts;
}

export type HubSession = SessionBase & {
  id: number;
  identity: {
    name: string;
  };
  settings: {
    use_main_chat_notify: boolean;
  };
  user?: HintedUser;
};

export type PrivateChatSession = SessionBase & {
  id: string;
  user: HintedUser;
  identity?: {
    name?: string;
  };
  settings?: {
    use_main_chat_notify: boolean;
  };
};

export type SessionInfo = HubSession | PrivateChatSession;