const fetch = require('node-fetch');

function createProxyFetch(ttlMs = 60000) {
  const cache = new Map();

  return async function proxyFetch(url) {
    const now = Date.now();

    if (cache.has(url)) {
      const { timestamp, data } = cache.get(url);
      if (now - timestamp < ttlMs) {
        console.log('[ProxyFetch] Returning cached data');
        return {
          ok: true,
          json: async () => data
        };
      }
    }

    console.log('[ProxyFetch] Fetching from real API');
    const res = await fetch(url);
    if (!res.ok) return res;

    const data = await res.json();
    cache.set(url, { timestamp: now, data });

    return {
      ok: true,
      json: async () => data
    };
  };
}

module.exports = createProxyFetch;

