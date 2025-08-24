export type Message = {
  from: { nick: string };
  text: string;
  time: number; // seconds epoch
};

export type SessionId = string | number;

export type SessionInfoGetter = (id: SessionId) => Promise<SessionInfo>;

export type SessionBase = {
  // id: SessionId;
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

export type SessionNameGetter = (sessionInfo: SessionInfo) => string;

export type SessionType = {
  title: string;
  sessionNameGetter: SessionNameGetter;
};

export type MessageCache = Record<string, Message[]>;
