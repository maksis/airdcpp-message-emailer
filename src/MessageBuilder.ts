import { Message, SessionType, MessageCache, SessionInfoGetter, SessionInfo, SessionId } from './types';

const formatTimeStamp = (time: number) => {
  const timeOffset = (-1) * new Date().getTimezoneOffset() * 60 * 1000;
  return new Date((time * 1e3) + timeOffset).toISOString().slice(-13, -5);
}

const reduceMessageSummary = (reduced: string, message: Message) => {
  const timeString = formatTimeStamp(message.time);
  reduced += `[${timeString}] <${message.from.nick}> ${message.text}\n`;
  return reduced;
};

const hasUnread = (sessionInfo: SessionInfo) => {
  const { unread } = sessionInfo.message_counts;
  return unread.bot > 0 || unread.user > 0;
};

const mapSessionInfo = async (sessionId: SessionId, sessionInfoGetter: SessionInfoGetter) => {
  try {
    return await sessionInfoGetter(sessionId);
  } catch (e) {
    // Session removed, assume that is has been read
  }

  return null;
};

const constructSummary = async ({ title, sessionNameGetter }: SessionType, cache: MessageCache, sessionInfoGetter: SessionInfoGetter) => {
  if (!cache) {
    return '';
  }

  const sessionsInfos = (await Promise.all(Object.keys(cache)
    .map(sessionId => mapSessionInfo(sessionId, sessionInfoGetter))))
    .filter(sessionInfo => !!sessionInfo)
    .filter(hasUnread);

  if (sessionsInfos.length == 0) {
    return '';
  }

  let ret = '';
  ret += `------- ${title} -------`;
  ret += '\n\n';

  return sessionsInfos.reduce((reduced: string, sessionInfo: any) => {
    reduced += `-- ${sessionNameGetter(sessionInfo)} --`;
    reduced += '\n\n';
    
    reduced += cache[sessionInfo.id].reduce(reduceMessageSummary, '');
    reduced += '\n\n';

    return reduced;
  }, ret);
}

export default {
  constructSummary,
};
