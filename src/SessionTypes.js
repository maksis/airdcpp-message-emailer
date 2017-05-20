
export default {
	hub: {
		title: 'Hub messages',
		sessionNameGetter: sessionInfo => sessionInfo.identity.name,
	},
	privateChat: {
		title: 'Private messages',
		sessionNameGetter: sessionInfo => sessionInfo.user.nicks,
	}
}