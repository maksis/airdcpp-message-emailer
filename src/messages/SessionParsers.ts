import { HubSession, PrivateChatSession, SessionParser } from "../types";

export const SessionParsers = {
  hub: {
    title: 'Hub messages',
    sessionNameGetter: (sessionInfo: HubSession) => sessionInfo.identity.name,
  } as SessionParser,
  privateChat: {
    title: 'Private messages',
    sessionNameGetter: (sessionInfo: PrivateChatSession) => sessionInfo.user.nicks,
  } as SessionParser,
};
