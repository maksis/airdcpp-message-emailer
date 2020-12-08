import MessageBuilder from '../src/MessageBuilder';
import SessionTypes from '../src/SessionTypes';


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

  const message1 = {
    from: {
      nick: 'TestNick1'
    },
    text: 'TestMessage1',
    time: 1494434082,
  };

  const message2 = {
    from: {
      nick: 'TestNick2'
    },
    text: 'TestMessage2',
    time: 1494435082,
  };

  const privateChatId1 = 'VZILDK44YRK37UJBED2KLZSORDWRKMLDIYIRULY';
  const privateChatId2 = 'AZILDK44YRK37UJFED2KLZSORDWRKMLDIYIRULY';

  const sessionInfo1 = {
    id: privateChatId1,
    user: {
      nicks: '[100]User1',
    },
    message_counts: {
      unread: {
        bot: 0,
        status: 0,
        user: 2,
      },
    },
  };

  const sessionInfo2 = {
    id: privateChatId2,
    user: {
      nicks: '[100]User2',
    },
    message_counts: {
      unread: {
        bot: 0,
        status: 0,
        user: 1,
      },
    },
  };


  const readSessionInfo = {
    user: {
      nicks: '[100]SeenUser',
    },
    message_counts: {
      unread: {
        bot: 0,
        status: 0,
        user: 0,
      },
    },
  };

  const cache = {
    [privateChatId1]: [
      message1,
      message2,
    ], 
    [privateChatId2]: [
      message1,
      message2,
    ]
  };

  test('should format messages', async () => {
    const sessionInfoGetter = sessionId => sessionId === privateChatId1 ? sessionInfo1 : sessionInfo2;

    const summary = await MessageBuilder.constructSummary(SessionTypes.privateChat, cache, sessionInfoGetter);
    expect(summary).toMatchSnapshot();
  });

  test('should skip read sessions', async () => {
    const sessionInfoGetter = (_sessionId) => readSessionInfo

    const summary = await MessageBuilder.constructSummary(SessionTypes.privateChat, cache, sessionInfoGetter);
    expect(summary).toEqual('');
  });

  test('should handle removed sessions', async () => {
    const sessionInfoGetter = (_sessionId) => Promise.reject('Session removed');

    const summary = await MessageBuilder.constructSummary(SessionTypes.privateChat, cache, sessionInfoGetter);
    expect(summary).toEqual('');
  });
});