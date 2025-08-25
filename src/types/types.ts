import { Message, SessionId, SessionInfo } from "./api";

export type SessionInfoGetter = (id: SessionId) => Promise<SessionInfo>;
export type SessionNameGetter = (sessionInfo: SessionInfo) => string;

export type SessionParser = {
  title: string;
  sessionNameGetter: SessionNameGetter;
};

export type MessageCache = Record<string, Message[]>;
