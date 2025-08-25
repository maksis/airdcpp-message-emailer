import MessageBuilder from './MessageBuilder';
import { Context, Message, MessageCache, SessionId } from '../types';

import { SessionParsers } from './SessionParsers';

import { Transporter } from '../transport/NodeMailer';
import { hasConfig } from '../utils';

export const MessageCollector = (mailer: Transporter, context: Context) => {
  const { api, logger, getExtSetting } = context;

  let flushTimeout: NodeJS.Timeout | undefined;

  const cache = {
    privateMessages: {} as MessageCache,
    hubMessages: {} as MessageCache,
  };

  // Send cached messages (if there are any)
  const flushCache = async () => {
    logger.verbose('Flushing cache...');
    let messageSummary = '';
    messageSummary += await MessageBuilder.constructSummary(SessionParsers.privateChat, cache.privateMessages, api.getPrivateChatSession);
    messageSummary += await MessageBuilder.constructSummary(SessionParsers.hub, cache.hubMessages, api.getHubSession);

    if (messageSummary) {
      mailer.sendMail(messageSummary);
    } else {
      logger.verbose('Nothing to send');
    }

    cache.privateMessages = {};
    cache.hubMessages = {};
    flushTimeout = undefined;
  };

  const onIncomingMessage = (cacheKey: keyof typeof cache, message: Message, sessionId: SessionId) => {
    if (!hasConfig(getExtSetting) || !getExtSetting('flush_interval')) {
      logger.verbose('Caching disabled due to current configuration');
      return;
    }

    const sessionCache = cache[cacheKey];
    sessionCache[sessionId] = sessionCache[sessionId] || [];
    sessionCache[sessionId].push(message);

    if (!flushTimeout) {
      const flushMs = getExtSetting('flush_interval') * 60 * 1000;
      logger.verbose('Scheduling flush', flushMs);
      flushTimeout = setTimeout(flushCache, flushMs);
    }
  };

  const onHubMessage = (message: Message, sessionId: SessionId) => {
    onIncomingMessage('hubMessages', message, sessionId);
  }

  const onPrivateMessage = (message: Message, sessionId: SessionId) => {
    onIncomingMessage('privateMessages', message, sessionId);
  };

  return {
    onHubMessage,
    onPrivateMessage,

    stop: () => {
      clearTimeout(flushTimeout);
    }
  };
};