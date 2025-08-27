import MessageBuilder from '../src/messages/MessageBuilder';
import { SessionPropertyParsers } from '../src/messages/SessionPropertyParsers';
import { SessionId } from '../src/types';

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { HubUser1, HubUser2, MessageCountsRead, PrivateChat1, PrivateChat2, User1Message1, User1Message2, User2Message1, User2Message2 } from './mocks/mock-entities';


describe('MessageBuilder', () => {
  const getTimezoneOffset = Date.prototype.getTimezoneOffset;

  beforeEach(() => {
    Date.prototype.getTimezoneOffset = () => {
      return -180;
    }
  });

  afterEach(() => {
    Date.prototype.getTimezoneOffset = getTimezoneOffset;
  });

  const cache: Record<string, any[]> = {
    [HubUser1.cid]: [
      User1Message1,
      User1Message2,
    ],
    [HubUser2.cid]: [
      User2Message1,
      User2Message2,
    ]
  };

  test('should format messages', async () => {
    const SessionInfoFetcher = (sessionId: SessionId) => {
      return Promise.resolve(sessionId === PrivateChat1.id ? PrivateChat1 : PrivateChat2);
    };

    const summary = await MessageBuilder.constructSummary(SessionPropertyParsers.privateChat, cache, SessionInfoFetcher);
    expect(summary).toMatchSnapshot();
  });

  test('should skip read sessions', async () => {
    const SessionInfoFetcher = (_sessionId: SessionId) => Promise.resolve({
      ...PrivateChat1,
      message_counts: MessageCountsRead
    });

    const summary = await MessageBuilder.constructSummary(SessionPropertyParsers.privateChat, cache, SessionInfoFetcher);
    expect(summary).toEqual('');
  });

  test('should handle removed sessions', async () => {
    const SessionInfoFetcher = (_sessionId: SessionId) => Promise.reject('Session removed');

    const summary = await MessageBuilder.constructSummary(SessionPropertyParsers.privateChat, cache, SessionInfoFetcher);
    expect(summary).toEqual('');
  });
});
