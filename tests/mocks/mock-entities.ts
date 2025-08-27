import { ChatMessage, ChatMessageCounts, HintedUser, HubSession, HubUser, PrivateChatSession } from "../../src/types"

// USERS
export const HubUser1: HubUser = {
  cid: 'VZILDK44YRK37UJBED2KLZSORDWRKMLDIYIRULY',
  nick: '[100]User1',
  flags: [ 'favorite' ],
}

export const HubUser2: HubUser = {
  cid: 'AZILDK44YRK37UJFED2KLZSORDWRKMLDIYIRULY',
  nick: '[100]User2',
  flags: [ 'op' ]
}

export const HubUserBot: HubUser = {
  cid: 'ED6HAL2DQXL7DGDMSCLAMCW2DZHNREKVKWVSQNY',
  nick: 'Bot',
  flags: [ 'bot', 'op' ]
}

export const HubUserChatroom: HubUser = {
  cid: 'CIOSP57JFYHQSYRDUU42MWK6G2DJ5ZSACMFA37Q',
  nick: 'Chatroom',
  flags: [ 'bot', 'op' ]
}

export const toHintedUser = ({ nick, ...user }: HubUser): HintedUser => {
  return {
    nicks: nick,
    ...user,
  }
}

// SESSIONS

export const MessageCountsUnread: ChatMessageCounts = {
  unread: {
    bot: 0,
    user: 2,
  },
};

export const MessageCountsRead: ChatMessageCounts = {
  unread: {
    bot: 0,
    user: 0,
  },
};

// PRIVATE CHAT
export const PrivateChat1: PrivateChatSession = {
  id: HubUser1.cid,
  user: toHintedUser(HubUser1),
  message_counts: MessageCountsUnread
};

export const PrivateChat2: PrivateChatSession = {
  id: HubUser2.cid,
  user: toHintedUser(HubUser2),
  message_counts: MessageCountsUnread,
};

// HUBS
export const Hub1: HubSession = {
  id: 1,
  identity: {
    name: 'Hub 1',
  },
  settings: {
    use_main_chat_notify: true,
  },
  message_counts: MessageCountsUnread
};

export const Hub2: HubSession = {
  id: 2,
  identity: {
    name: 'Hub 2',
  },
  settings: {
    use_main_chat_notify: false,
  },
  message_counts: MessageCountsUnread,
};

// MESSAGES
export const User1Message1: ChatMessage = {
  id: 1,
  from: HubUser1,
  reply_to: HubUser1,
  text: 'User 1 message 1',
  time: 1494434082,
  has_mention: false,
};

export const User1Message2: ChatMessage = {
  id: 2,
  from: HubUser1,
  reply_to: HubUser1,
  text: 'User 1 message 2',
  time: 1494434582,
  has_mention: false,
};


export const User2Message1: ChatMessage = {
  id: 10,
  from: HubUser2,
  reply_to: HubUser2,
  text: 'User 2 message 1',
  time: 1494435082,
  has_mention: false,
};

export const User2Message2: ChatMessage = {
  id: 11,
  from: HubUser2,
  reply_to: HubUser2,
  text: 'User 2 message 2',
  time: 1494435582,
  has_mention: false,
};