import MessageBuilder from './MessageBuilder';
import { Context, ChatMessage, MessageCache, SessionId, PrivateChatSession, HubSession } from '../types';

import { SessionPropertyParsers } from './SessionPropertyParsers';

import { Transporter } from '../transport/NodeMailer';
import { hasConfig } from '../utils';
import { parseHubMessageLevel, parsePrivateMessageLevel } from './MessageLevelParser';
import { HubMessageModePriority, PrivateChatModePriority } from '../settings';
import { SessionCache } from './SessionCache';

export const MessageCollector = (mailer: Transporter, context: Context) => {
  const { api, logger, getExtSetting } = context;

  let flushTimeout: NodeJS.Timeout | undefined;

  const sessionCache = {
    privateMessages: SessionCache<PrivateChatSession>(api.getPrivateChatSession),
    hubMessages: SessionCache<HubSession>(api.getHubSession),
  };

  const sessionMessageCache = {
    privateMessages: {} as MessageCache,
    hubMessages: {} as MessageCache,
  };

  // Send cached messages (if there are any)
  const flushCache = async () => {
    logger.verbose('Flushing cache...');
    let messageSummary = '';
    messageSummary += await MessageBuilder.constructSummary(SessionPropertyParsers.privateChat, sessionMessageCache.privateMessages, sessionCache.privateMessages.getSession);
    messageSummary += await MessageBuilder.constructSummary(SessionPropertyParsers.hub, sessionMessageCache.hubMessages, sessionCache.hubMessages.getSession);

    if (messageSummary) {
      mailer.sendMail(messageSummary);
    } else {
      logger.verbose('Nothing to send');
    }

    sessionMessageCache.privateMessages = {};
    sessionMessageCache.hubMessages = {};
    flushTimeout = undefined;
  };

  const onIncomingMessage = (cacheKey: keyof typeof sessionMessageCache, message: ChatMessage, sessionId: SessionId) => {
    if (!hasConfig(getExtSetting) || !getExtSetting('flush_interval')) {
      logger.verbose('Caching disabled due to current configuration');
      return;
    }

    const sessionMessages = sessionMessageCache[cacheKey];
    sessionMessages[sessionId] = sessionMessages[sessionId] || [];
    sessionMessages[sessionId].push(message);
    logger.verbose(`Cached message ${message.id} for session ${sessionId}, total: ${sessionMessages[sessionId].length}`);

    if (!flushTimeout) {
      const flushMs = getExtSetting('flush_interval') * 60 * 1000;
      logger.verbose('Scheduling flush', flushMs);
      flushTimeout = setTimeout(flushCache, flushMs);
    }
  };

  const onHubMessage = async (message: ChatMessage, sessionId: SessionId) => {
    try {
      const hubSession = await sessionCache.hubMessages.getSession(sessionId);

      const level = HubMessageModePriority[parseHubMessageLevel(message, hubSession.settings.use_main_chat_notify)];
      const requiredLevel = HubMessageModePriority[getExtSetting('hub_message_mode')];
      if (level < requiredLevel) {
        logger.verbose(`Ignoring hub message due to current configuration (has level ${level} while ${requiredLevel} is required)`);
        return;
      }
    } catch (error) {
      logger.error('Could not fetch hub session for a received message', error);
      return;
    }

    onIncomingMessage('hubMessages', message, sessionId);
  }

  const onPrivateMessage = async (message: ChatMessage, sessionId: SessionId) => {
    const level = PrivateChatModePriority[parsePrivateMessageLevel(message)];
    const requiredLevel = PrivateChatModePriority[getExtSetting('private_chat_message_mode')];
    if (level < requiredLevel) {
      logger.verbose(`Ignoring private message due to current configuration (has level ${level} while ${requiredLevel} is required)`);
      return;
    }

    onIncomingMessage('privateMessages', message, sessionId);
  };

  return {
    onHubMessage,
    onPrivateMessage,
    stop: () => {
      clearTimeout(flushTimeout);
    },

    getPrivateChatSessionMessages: (sessionId: SessionId) => {
      return sessionMessageCache.privateMessages[sessionId];
    },
    getHubSessionMessages: (sessionId: SessionId) => {
      return sessionMessageCache.hubMessages[sessionId];
    },
    hasPendingFlush: () => {
      return !!flushTimeout;
    },
    flush: () => {
      return flushCache();
    }
  };
};