import { ChatMessage, SessionParser, MessageCache, SessionInfoFetcher, SessionInfo, SessionId } from '../types';

const formatTimeStamp = (time: number) => {
  const timeOffset = (-1) * new Date().getTimezoneOffset() * 60 * 1000;
  return new Date((time * 1e3) + timeOffset).toISOString().slice(-13, -5);
}

const reduceMessageSummary = (reduced: string, message: ChatMessage) => {
  const timeString = formatTimeStamp(message.time);
  reduced += `[${timeString}] <${message.from.nick}> ${message.text}\n`;
  return reduced;
};

const hasUnread = (sessionInfo: SessionInfo) => {
  const { unread } = sessionInfo.message_counts;
  return unread.bot > 0 || unread.user > 0;
};

const mapSessionInfo = async (sessionId: SessionId, SessionInfoFetcher: SessionInfoFetcher<SessionInfo>) => {
  try {
    // Skip the session cache to get the latest read status
    const session = await SessionInfoFetcher(sessionId, true);
    return session;
  } catch (e) {
    // Session removed, assume that is has been read
  }

  return null;
};

const constructSummary = async ({ title, sessionNameGetter }: SessionParser, cache: MessageCache, SessionInfoFetcher: SessionInfoFetcher<SessionInfo>) => {
  if (!cache) {
    return '';
  }

  const sessionsInfos = (await Promise.all(Object.keys(cache)
    .map(sessionId => mapSessionInfo(sessionId, SessionInfoFetcher))))
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
