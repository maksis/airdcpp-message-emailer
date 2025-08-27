import { ChatMessage, SessionBase, SessionId, SessionInfo } from "./api";

export type SessionInfoFetcher<SessionType extends SessionBase> = (id: SessionId, skipCache?: boolean) => Promise<SessionType>;
export type SessionNameGetter = (sessionInfo: SessionInfo) => string;

export type SessionParser = {
  title: string;
  sessionNameGetter: SessionNameGetter;
};

export type MessageCache = Record<string, ChatMessage[]>;
