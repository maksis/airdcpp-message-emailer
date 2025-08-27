import { SessionId } from '../src/types';

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hub1, Hub2, HubUser1, PrivateChat1, PrivateChat2, User1Message1, User2Message1 } from './mocks/mock-entities';

import { MessageCollector } from '../src/messages/MessageCollector';
import { Transporter } from '../src/transport/NodeMailer';
import { createMockContext } from './mocks/mock-context';
import { HubMessageCollectorMode, PrivateChatCollectorMode } from '../src/settings';


describe('MessageCollector', () => {
  const getTimezoneOffset = Date.prototype.getTimezoneOffset;

  beforeEach(() => {
    Date.prototype.getTimezoneOffset = () => {
      return -180;
    }
  });

  afterEach(() => {
    Date.prototype.getTimezoneOffset = getTimezoneOffset;
  });

  const createMockTransport = () => {
    const transport: Transporter = {
      sendMail: vi.fn(),
      reset: vi.fn(),
    };

    return transport;
  }

  const PrivateChatSessionInfoFetcher = (sessionId: SessionId) => {
    return Promise.resolve(sessionId === HubUser1.cid ? PrivateChat1 : PrivateChat2);
  };

  const HubSessionInfoFetcher = (sessionId: SessionId) => {
    return Promise.resolve(sessionId === Hub1.id.toString() ? Hub1 : Hub2);
  };

  test('should collect messages', async () => {
    const apiOverrides = {
      postEvent: vi.fn(),
      getPrivateChatSession: PrivateChatSessionInfoFetcher,
      getHubSession: HubSessionInfoFetcher,
    };

    const mockTransport = createMockTransport();
    const context = createMockContext({ apiOverrides });
    const messageCollector = MessageCollector(mockTransport, context);

    // Add messages
    await messageCollector.onHubMessage(User1Message1, Hub1.id);
    await messageCollector.onPrivateMessage(User2Message1, PrivateChat1.id);

    const hubMessages = messageCollector.getHubSessionMessages(Hub1.id);
    expect(hubMessages).toEqual([User1Message1]);

    const privateMessages = messageCollector.getPrivateChatSessionMessages(PrivateChat1.id);
    expect(privateMessages).toEqual([User2Message1]);

    expect(messageCollector.hasPendingFlush()).toBe(true);

    // Flush
    await messageCollector.flush();

    expect(messageCollector.hasPendingFlush()).toBe(false);
    expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
    expect(mockTransport.sendMail).toMatchSnapshot();
  });

  test('should ignore messages', async () => {
    const apiOverrides = {
      postEvent: vi.fn(),
      getHubSession: HubSessionInfoFetcher,
    };

    const settingOverrides = {
      hub_message_mode: HubMessageCollectorMode.DISABLED,
      private_chat_message_mode: PrivateChatCollectorMode.DISABLED,
    }

    const mockTransport = createMockTransport();
    const context = createMockContext({ apiOverrides, settingOverrides });
    const messageCollector = MessageCollector(mockTransport, context);

    // Add messages
    await messageCollector.onHubMessage(User1Message1, Hub1.id);
    await messageCollector.onPrivateMessage(User2Message1, PrivateChat1.id);

    // Nothing should exist
    expect(messageCollector.hasPendingFlush()).toBe(false);
  });
});
