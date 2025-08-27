import { HubMessageCollectorMode, PrivateChatCollectorMode } from "../settings";
import { ChatMessage } from "../types";

export const parsePrivateMessageLevel = (message: ChatMessage) => {
  if (message.reply_to.flags.includes('favorite')) {
    return PrivateChatCollectorMode.FAVORITE_USERS;
  }

  const fromBot = message.from.flags.includes('bot');
  if (!fromBot) {
    const chatRoom = message.from.cid !== message.reply_to.cid;
    if (!chatRoom || message.has_mention) {
      return PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS;
    }

    if (chatRoom) {
      return PrivateChatCollectorMode.USERS_CHATROOMS;
    }
  }

  return PrivateChatCollectorMode.ALL;
}

export const parseHubMessageLevel = (message: ChatMessage, hubNotificationsEnabled: boolean) => {
  const fromBot = message.from.flags.includes('bot');

  if (!fromBot) {
    if (message.has_mention) {
      return HubMessageCollectorMode.MENTIONS_ONLY;
    }

    if (hubNotificationsEnabled) {
      return HubMessageCollectorMode.MENTIONS_USERS_NOTIFY_ONLY;
    }

    return HubMessageCollectorMode.USERS_ONLY;
  }

  return HubMessageCollectorMode.ALL;
};
