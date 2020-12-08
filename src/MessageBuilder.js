
const reduceMessageSummary = (reduced, message) => {
  const timeOffset = (-1) * new Date().getTimezoneOffset() * 60 * 1000;
  const timeString = new Date((message.time * 1e3) + timeOffset).toISOString().slice(-13, -5);
  reduced += `[${timeString}] <${message.from.nick}> ${message.text}\n`;
  return reduced;
};

const hasUnread = (sessionInfo) => {
  const { unread } = sessionInfo.message_counts;
  return unread.bot > 0 || unread.user > 0;
};

const mapSessionInfo = async (sessionId, sessionInfoGetter) => {
  try {
    return await sessionInfoGetter(sessionId);
  } catch (e) {
    // Session removed, assume that is has been read
  }

  return null;
};

const constructSummary = async ({ title, sessionNameGetter }, cache, sessionInfoGetter) => {
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

  return sessionsInfos.reduce((reduced, sessionInfo) => {
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