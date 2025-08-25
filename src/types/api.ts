export type Message = {
  from: { nick: string };
  text: string;
  time: number; // seconds epoch
};

export type SessionId = string | number;

export const enum SeverityEnum {
  NOTIFY = 'notify',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}


export type SessionBase = {
  message_counts: {
    unread: {
      bot: number;
      status: number;
      user: number;
    };
  };
};

export type HubSession = SessionBase & {
  identity: {
    name: string;
  };
  user?: {
    nicks?: string;
  };
};

export type PrivateChatSession = SessionBase & {
  user: {
    nicks: string;
  };
  identity?: {
    name?: string;
  };
};

export type SessionInfo = HubSession | PrivateChatSession;