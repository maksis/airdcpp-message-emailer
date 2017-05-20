
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

const constructSummary = async ({ title, sessionNameGetter }, cache, sessionInfoGetter) => {
	let sessionsInfos = (await Promise.all(Object.keys(cache)
		.map(sessionInfoGetter)))
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