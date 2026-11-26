const CONFIG_URL = 'https://richard190104.github.io/domveli-be/config.json';
let configPromise;

// Všetky komponenty zdieľajú jednu požiadavku a rovnakú konfiguráciu.
export function loadConfig() {
  if (!configPromise) {
    configPromise = fetchConfig();
  }

  return configPromise;
}

async function fetchConfig() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    let response;
    // Predstiahnutú požiadavku si vezme len jeden modul. Hneď ju vynulujeme,
    // inak by ju dva moduly čítali naraz ("body stream already read").
    const shared = window.__dvConfigFetch;
    window.__dvConfigFetch = null;
    try {
      response = shared ? await shared : null;
    } catch { response = null; }
    if (!response || !response.ok) {
      response = await fetch(CONFIG_URL, {
        cache: 'no-cache',
        credentials: 'omit',
        signal: controller.signal
      });
    }

    if (!response.ok) {
      throw new Error(`Konfigurácia: HTTP ${response.status}`);
    }

    const config = await response.json();
    const homepage = config?.DOMVELI_CONFIG;

    if (!homepage || !Array.isArray(homepage.categories) ||
        !Array.isArray(homepage.banners) ||
        !Array.isArray(config.notificationsConfig) ||
        !Array.isArray(config.navbannerConfig)) {
      throw new Error('Konfigurácia nemá očakávanú štruktúru.');
    }

    // Relatívne obrázky patria k vzdialenému configu, Shoptet /user/ cesty ostávajú lokálne.
    function resolveImages(value, parentKey = '') {
      if (!value || typeof value !== 'object') return;
      Object.entries(value).forEach(([key, item]) => {
        if (typeof item === 'string' && (key === 'image' || parentKey === 'images') &&
            item && !item.startsWith('/')) {
          value[key] = new URL(item, CONFIG_URL).href;
        } else {
          resolveImages(item, key);
        }
      });
    }
    resolveImages(config);

    return config;
  } finally {
    clearTimeout(timeout);
  }
}
