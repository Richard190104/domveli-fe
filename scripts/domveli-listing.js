
/* DOMVELI | Listing + cart quantities | v4.0 */
(() => {
  'use strict';

  const KEY = '__dvListingV4';
  if (window[KEY]) return;
  window[KEY] = true;

  const CARD_SELECTOR = '#products.products-block > .product > .p';

  const cart = new Map();
  const busy = new Set();

  let cartReady = false;
  let refreshScheduled = false;
  let refreshTimer = null;

  function getCartItems() {
    const layer = window.dataLayer;

    if (!Array.isArray(layer)) return null;

    for (let i = layer.length - 1; i >= 0; i--) {
      const info = layer[i]?.shoptet?.cartInfo;

      if (Array.isArray(info?.cartItems)) {
        return info.cartItems;
      }
    }

    return null;
  }

  function getCode(product) {
    return product
      .querySelector('[data-micro="sku"]')
      ?.textContent
      ?.trim() || '';
  }

  function setCartItems(items) {
    const next = new Map();

    for (const item of items) {
      const code = String(item.code || '').trim();
      const quantity = Number(item.quantity) || 0;

      if (!code || quantity <= 0) continue;

      const existing = next.get(code);

      if (existing) {
        existing.quantity += quantity;
      } else {
        next.set(code, {
          code,
          quantity,
          itemId: item.itemId ?? null,
          priceId: item.priceId ?? null
        });
      }
    }

    cart.clear();

    for (const [code, item] of next) {
      cart.set(code, item);
    }

    cartReady = true;
    render();
  }

  function refreshFromDataLayer() {
    const items = getCartItems();

    if (!items) return false;

    setCartItems(items);
    return true;
  }

  function scheduleRefresh() {
    if (refreshScheduled) return;

    refreshScheduled = true;

    requestAnimationFrame(() => {
      refreshScheduled = false;
      refreshFromDataLayer();
    });
  }

  function getTools(product) {
    return product.querySelector('.p-tools');
  }

  function initCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach(product => {
      // Obrázok dostane vlastný obal.
      if (!product.querySelector('.dv-product-media')) {
        const image = product.querySelector(':scope > a.image');

        if (image) {
          const media = document.createElement('div');
          media.className = 'dv-product-media';

          product.insertBefore(media, image);
          media.append(image);
        }
      }

      const tools = getTools(product);
      const bottom = product.querySelector('.p-bottom');

      if (!tools || !bottom) return;

      // Tlačidlá zostávajú pri cene.
      if (tools.parentElement !== bottom) {
        bottom.append(tools);
      }

      // Počítadlo vytvoríme iba raz.
      if (tools.querySelector('.dv-qty')) return;

      const qty = document.createElement('div');
      qty.className = 'dv-qty';
      qty.hidden = true;

      qty.innerHTML = `
        <button
          type="button"
          class="dv-qty-minus"
          aria-label="Odobrať jeden kus"
        >−</button>

        <output
          class="dv-qty-value"
          aria-live="polite"
        >1</output>

        <button
          type="button"
          class="dv-qty-plus"
          aria-label="Pridať jeden kus"
        >+</button>
      `;

      tools.append(qty);
    });

    render();
  }

  function render() {
    document.querySelectorAll(CARD_SELECTOR).forEach(product => {
      const code = getCode(product);
      const tools = getTools(product);

      if (!code || !tools) return;

      const qty = tools.querySelector('.dv-qty');
      const form = tools.querySelector('form.pr-action');

      if (!qty || !form) return;

      // Kým nemáme potvrdený obsah košíka,
      // ponecháme pôvodné Shoptet tlačidlo.
      if (!cartReady) return;

      const item = cart.get(code);
      const present = Boolean(item && item.quantity > 0);

      qty.hidden = !present;
      form.hidden = present;

      if (present) {
        const output = qty.querySelector('.dv-qty-value');
        const value = String(item.quantity);

        if (output.textContent !== value) {
          output.textContent = value;
        }
      }

      qty.querySelectorAll('button').forEach(button => {
        button.disabled = busy.has(code);
      });
    });
  }

  function waitForCartChange(code, previousQuantity, timeout = 5000) {
    return new Promise(resolve => {
      let finished = false;

      const finish = success => {
        if (finished) return;

        finished = true;

        document.removeEventListener(
          'ShoptetDataLayerUpdated',
          check
        );

        document.removeEventListener(
          'ShoptetCartUpdated',
          check
        );

        clearTimeout(timer);
        resolve(success);
      };

      const check = () => {
        const items = getCartItems();

        if (!items) return;

        const quantity = items
          .filter(item => String(item.code || '').trim() === code)
          .reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
          );

        if (quantity !== previousQuantity) {
          setCartItems(items);
          finish(true);
        }
      };

      const timer = setTimeout(() => finish(false), timeout);

      document.addEventListener(
        'ShoptetDataLayerUpdated',
        check
      );

      document.addEventListener(
        'ShoptetCartUpdated',
        check
      );

      check();
    });
  }

  async function changeQuantity(code, delta) {
    const item = cart.get(code);

    if (!item || busy.has(code)) return;

    if (item.itemId == null || item.priceId == null) {
      console.warn(
        'DOMVELI: Missing cart item identifiers',
        code
      );
      return;
    }

    const api = window.shoptet?.cartShared;

    if (!api) {
      console.warn('DOMVELI: Shoptet cart API unavailable');
      return;
    }

    const nextQuantity = item.quantity + delta;

    if (
      nextQuantity > 0 &&
      typeof api.updateQuantityInCart !== 'function'
    ) {
      console.warn(
        'DOMVELI: updateQuantityInCart unavailable'
      );
      return;
    }

    if (
      nextQuantity <= 0 &&
      typeof api.removeFromCart !== 'function'
    ) {
      console.warn('DOMVELI: removeFromCart unavailable');
      return;
    }

    busy.add(code);
    render();

    // Listener pripravíme ešte pred volaním API,
    // aby sme neprehliadli rýchlu aktualizáciu.
    const confirmation = waitForCartChange(
      code,
      item.quantity
    );

    try {
      if (nextQuantity <= 0) {
        api.removeFromCart({
          itemId: item.itemId
        });
      } else {
        api.updateQuantityInCart({
          itemId: item.itemId,
          priceId: item.priceId,
          amount: nextQuantity
        });
      }

      const confirmed = await confirmation;

      if (!confirmed) {
        console.warn(
          'DOMVELI: Cart update was not confirmed',
          code
        );
        refreshFromDataLayer();
      }
    } catch (error) {
      console.error(
        'DOMVELI: Quantity update failed',
        error
      );
      refreshFromDataLayer();
    } finally {
      busy.delete(code);
      render();
    }
  }

  function onQuantityClick(event) {
    const button = event.target.closest('.dv-qty button');

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    if (button.disabled) return;

    const product = button.closest('.p');
    if (!product) return;

    const code = getCode(product);
    if (!code) return;

    const delta = button.classList.contains('dv-qty-plus')
      ? 1
      : -1;

    changeQuantity(code, delta);
  }

  function onCartUpdated() {
    scheduleRefresh();
  }

  function onCartAdded() {
    // Shoptet spracuje pridanie.
    // Po aktualizácii dataLayer vykreslíme nový stav.
    scheduleRefresh();
  }

  function start() {
    if (!document.body.classList.contains('type-category')) {
      return;
    }

    refreshFromDataLayer();
    initCards();

    document.addEventListener(
      'click',
      onQuantityClick
    );

    document.addEventListener(
      'ShoptetDataLayerUpdated',
      onCartUpdated
    );

    document.addEventListener(
      'ShoptetCartUpdated',
      onCartUpdated
    );

    document.addEventListener(
      'ShoptetCartAddCartItem',
      onCartAdded
    );


/* DOMVELI | Opätovná inicializácia po AJAX radení */

let cardsScheduled = false;

const observer = new MutationObserver(() => {
  if (cardsScheduled) return;

  const cards = document.querySelectorAll(CARD_SELECTOR);

  const needsInit = [...cards].some(product => {
    return (
      !product.querySelector('.dv-product-media') ||
      !product.querySelector('.dv-qty')
    );
  });

  if (!needsInit) return;

  cardsScheduled = true;

  requestAnimationFrame(() => {
    cardsScheduled = false;
    initCards();
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  
/* DOMVELI | Jednotná doba zobrazenia notifikácie */

function initNotificationTiming() {
  const duration = 2500;
  const timers = new WeakMap();

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.messages .msg').forEach(msg => {
      if (timers.has(msg)) return;

      const timer = setTimeout(() => {
        if (msg.isConnected) {
          msg.remove();
        }
        timers.delete(msg);
      }, duration);

      timers.set(msg, timer);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initNotificationTiming
  );
} else {
  initNotificationTiming();
}

})();


