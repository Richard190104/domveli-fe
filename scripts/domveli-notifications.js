
import { loadConfig } from './domveli-config-loader.js?v=1';

let notificationsConfig;
let navbannerConfig;

const SETTINGS = {
  popupDelay: 2000,
  imageInterval: 3500
};

// Pomocne funkcie

function createElement(tag, className = '', text = null) {
  const el = document.createElement(tag);

  if (className) el.className = className;
  if (text !== null) el.textContent = text;

  return el;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function parseDate(value, endOfDay = false) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})[.-](\d{1,2})[.-](\d{1,2})$/
  );

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(
    year,
    month,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isActive(item) {
  const now = new Date();
  const from = parseDate(item.activeFrom);
  const to = parseDate(item.activeTo, true);

  return (!from || now >= from) &&
         (!to || now <= to);
}

function safeLink(value) {
  if (typeof value !== 'string') return '#';

  const link = value.trim();

  if (link.startsWith('/') && !link.startsWith('//')) {
    return link;
  }

  try {
    const url = new URL(link, window.location.origin);

    if (
      url.origin === window.location.origin &&
      ['http:', 'https:'].includes(url.protocol)
    ) {
      return url.href;
    }
  } catch {}

  return '#';
}

// ===================================
// HORNA LISTA
// ===================================

function initNavBanner() {
  const storageKey = 'dv-navbanner-dismissed';

  try {
    if (sessionStorage.getItem(storageKey) === '1') {
      return;
    }
  } catch {}

  const items = (
    Array.isArray(navbannerConfig)
      ? navbannerConfig
      : []
  ).filter(isActive);

  if (!items.length) return;

  const item = randomItem(items);

  const banner = createElement(
    'aside',
    'dv-navbanner'
  );

  const content = createElement(
    'div',
    'dv-navbanner__content'
  );

  const text = createElement(
    'div',
    'dv-navbanner__text'
  );

  if (item.title) {
    text.append(
      createElement(
        'strong',
        'dv-navbanner__title',
        item.title
      )
    );
  }

  if (item.description) {
    text.append(
      createElement(
        'span',
        'dv-navbanner__description',
        item.description
      )
    );
  }

  content.append(text);


if (item.link) {
  const button = createElement(
    'a',
    'dv-navbanner__button',
    item.buttonText || 'Viac informácií'
  );

  button.href = safeLink(item.link);

  // Po kliknuti na tlacidlo si zapamatame,
  // ze zakaznik uz hornu listu videl.
  button.addEventListener('click', () => {
    try {
      sessionStorage.setItem(
        'dv-navbanner-dismissed',
        '1'
      );
    } catch {}
  });

  content.append(button);
}


  const close = createElement(
    'button',
    'dv-navbanner__close',
    '×'
  );

  close.type = 'button';
  close.setAttribute(
    'aria-label',
    'Zavrieť hornú lištu'
  );

  close.addEventListener('click', () => {
    banner.remove();

    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {}
  });

  banner.append(content, close);
  document.body.prepend(banner);
}

// ===================================
// PRODUKTOVY POPUP
// ===================================

function initPopup() {
  const storageKey = 'dv-popup-dismissed';

  try {
    if (sessionStorage.getItem(storageKey) === '1') {
      return;
    }
  } catch {}

  const items = (
    Array.isArray(notificationsConfig)
      ? notificationsConfig
      : []
  ).filter(isActive);

  if (!items.length) return;

  const item = randomItem(items);

  const overlay = createElement(
    'div',
    'dv-popup-overlay'
  );

  const popup = createElement(
    'section',
    'dv-popup'
  );

  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute(
    'aria-label',
    item.title || 'Novinky DOMVELI'
  );

  const close = createElement(
    'button',
    'dv-popup__close',
    '×'
  );

  close.type = 'button';
  close.setAttribute(
    'aria-label',
    'Zavrieť okno'
  );

  const media = createElement(
    'div',
    'dv-popup__media'
  );

  const images = (
    Array.isArray(item.images)
      ? item.images
      : []
  ).filter(Boolean);

  let imageTimer = null;

  if (images.length) {
    const image = createElement(
      'img',
      'dv-popup__image'
    );

    image.src = images[0];
    image.alt = item.title || '';
    media.append(image);

    if (images.length > 1) {
      let index = 0;

      imageTimer = window.setInterval(() => {
        index = (index + 1) % images.length;
        image.src = images[index];
      }, SETTINGS.imageInterval);
    }
  } else {
    media.hidden = true;
    popup.classList.add('dv-popup--no-image');
  }

  const body = createElement(
    'div',
    'dv-popup__body'
  );

  const eyebrow = createElement(
    'span',
    'dv-popup__eyebrow',
    'ODPORÚČAME Z DOMVELI'
  );

  const title = createElement(
    'h2',
    'dv-popup__title',
    item.title || 'Vianočná inšpirácia'
  );

  const description = createElement(
    'p',
    'dv-popup__description',
    item.description || ''
  );

  body.append(eyebrow, title, description);


if (item.link) {
  const action = createElement(
    'a',
    'dv-popup__button',
    item.buttonText || 'Pozrieť ponuku'
  );

  action.href = safeLink(item.link);

  // Po kliknuti na produkt uz popup
  // znovu nezobrazime v tejto relacii.
  action.addEventListener('click', () => {
    try {
      sessionStorage.setItem(
        'dv-popup-dismissed',
        '1'
      );
    } catch {}
  });

  body.append(action);
}

  popup.append(media, body, close);
  overlay.append(popup);

  let opened = false;
  let previousFocus = null;

  function dismiss() {
    if (!opened) return;

    opened = false;
    overlay.remove();
    document.body.classList.remove('dv-popup-open');

    if (imageTimer) {
      window.clearInterval(imageTimer);
    }

    document.removeEventListener(
      'keydown',
      handleKeydown
    );

    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {}

    if (
      previousFocus &&
      typeof previousFocus.focus === 'function'
    ) {
      previousFocus.focus();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      dismiss();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = [...popup.querySelectorAll(
        'button:not([disabled]), a[href]'
      )];

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  close.addEventListener('click', dismiss);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) dismiss();
  });

  window.setTimeout(() => {
    if (document.querySelector('.dv-popup-overlay')) {
      return;
    }

    previousFocus = document.activeElement;
    opened = true;

    document.body.append(overlay);
    document.body.classList.add('dv-popup-open');

    document.addEventListener(
      'keydown',
      handleKeydown
    );

    close.focus();
  }, SETTINGS.popupDelay);
}

// ===================================
// SPUSTENIE
// ===================================

async function init() {
  try {
    ({ notificationsConfig, navbannerConfig } = await loadConfig());
  } catch (error) {
    console.error('[DOMVELI] Notifikácie: konfiguráciu sa nepodarilo načítať.', error);
    return;
  }

  if (!document.querySelector('.dv-navbanner')) {
    initNavBanner();
  }

  if (!document.querySelector('.dv-popup-overlay')) {
    initPopup();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    init,
    { once: true }
  );
} else {
  init();
}
