import { ChatMessage } from '../src/types';

import { describe, test, expect } from 'vitest';
import { HubUser1, HubUser2, HubUserBot, HubUserChatroom } from './mocks/mock-entities';

import { parseHubMessageLevel, parsePrivateMessageLevel } from '../src/messages/MessageLevelParser';
import { HubMessageCollectorMode, PrivateChatCollectorMode } from '../src/settings';


describe('MessageLevelParser', () => {
  const message1: ChatMessage = {
    id: 1,
    from: HubUser1,
    reply_to: HubUser1,
    text: 'TestMessage1',
    time: 1494434082,
    has_mention: false,
  };

  const message2: ChatMessage = {
    id: 2,
    from: HubUser2,
    reply_to: HubUser2,
    text: 'TestMessage2',
    time: 1494435082,
    has_mention: false,
  };


  describe('hub message levels', () => {
    test('mentions', async () => {
      const message: ChatMessage = {
        ...message1,
        has_mention: true,
      }

      const result = parseHubMessageLevel(message, true);
      expect(result).toEqual(HubMessageCollectorMode.MENTIONS_ONLY);
    });

    test('hub message notify', async () => {
      const message: ChatMessage = {
        ...message1,
      }

      const result = parseHubMessageLevel(message, true);
      expect(result).toEqual(HubMessageCollectorMode.MENTIONS_USERS_NOTIFY_ONLY);
    });

    test('hub users', async () => {
      const message: ChatMessage = {
        ...message1,
      }

      const result = parseHubMessageLevel(message, false);
      expect(result).toEqual(HubMessageCollectorMode.USERS_ONLY);
    });

    test('all messages', async () => {
      const message: ChatMessage = {
        ...message1,
        from: HubUserBot
      }

      const result = parseHubMessageLevel(message, false);
      expect(result).toEqual(HubMessageCollectorMode.ALL);
    });
  });

  describe('private chat message levels', () => {
    test('favorites', async () => {
      const message: ChatMessage = {
        ...message1,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.FAVORITE_USERS);
    });

    test('chat room mentions', async () => {
      const message: ChatMessage = {
        ...message2,
        reply_to: HubUserChatroom,
        has_mention: true,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS);
    });

    test('direct user messages', async () => {
      const message: ChatMessage = {
        ...message2,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.USERS_CHATROOM_MENTIONS);
    });

    test('chat room messages', async () => {
      const message: ChatMessage = {
        ...message2,
        reply_to: HubUserChatroom,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.USERS_CHATROOMS);
    });

    test('direct bot messages', async () => {
      const message: ChatMessage = {
        ...message2,
        from: HubUserBot,
        reply_to: HubUserBot,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.ALL);
    });

    test('chatroom bot messages', async () => {
      const message: ChatMessage = {
        ...message2,
        from: HubUserBot,
        reply_to: HubUserChatroom,
      }

      const result = parsePrivateMessageLevel(message);
      expect(result).toEqual(PrivateChatCollectorMode.ALL);
    });
  });
});
