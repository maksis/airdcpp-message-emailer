import { APISocket } from 'airdcpp-apisocket';
import { SessionInfoFetcher } from './types/types';
import { HubSession, PrivateChatSession, SeverityEnum } from './types';


export const API = (socket: APISocket) => {
  const getPrivateChatSession: SessionInfoFetcher<PrivateChatSession> = (sessionId) => socket.get(`private_chat/${sessionId}`);
  const getHubSession: SessionInfoFetcher<HubSession> = (sessionId) => socket.get(`hubs/${sessionId}`);


  const postEvent = async (text: string, severity: SeverityEnum) => {
    return socket.post(
      'events',
      {
        text,
        severity,
      }
    );
  };

  return {
    getPrivateChatSession,
    getHubSession,
    postEvent,
  }
};

export type APIType = ReturnType<typeof API>;
