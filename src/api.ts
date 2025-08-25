import { APISocket } from 'airdcpp-apisocket';
import { SessionInfoGetter } from './types/types';
import { SeverityEnum } from './types';


export const API = (socket: APISocket) => {
  const getPrivateChatSession: SessionInfoGetter = (sessionId) => socket.get(`private_chat/${sessionId}`);
  const getHubSession: SessionInfoGetter = (sessionId) => socket.get(`hubs/${sessionId}`);


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
