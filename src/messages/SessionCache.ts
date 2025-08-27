
import TTLCache from '@isaacs/ttlcache';
import { SessionBase, SessionId, SessionInfoFetcher } from '../types';

const SESSION_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const SessionCache = <SessionType extends SessionBase>(sessionInfoFetcher: SessionInfoFetcher<SessionType>, ttl = SESSION_CACHE_TTL) => {
  const cache = new TTLCache<SessionId | number, SessionType>({ ttl });

  const getSession = async (sessionId: SessionId, ignoreCache = false) => {
    if (!ignoreCache) {
      const cached = await cache.get(sessionId);
      if (cached) {
        return cached;
      }
    }

    const session = await sessionInfoFetcher(sessionId);
    cache.set(sessionId, session);
    return session;
  };

  return {
    getSession
  };
};
