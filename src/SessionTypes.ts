import { HubSession, PrivateChatSession, SessionType } from "./types";

const SessionTypes = {
  hub: {
    title: 'Hub messages',
    sessionNameGetter: (sessionInfo: HubSession) => sessionInfo.identity.name,
  } as SessionType,
  privateChat: {
    title: 'Private messages',
    sessionNameGetter: (sessionInfo: PrivateChatSession) => sessionInfo.user.nicks,
  } as SessionType,
};

export default SessionTypes;
