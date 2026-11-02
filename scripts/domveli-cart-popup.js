
/* DOMVELI | Add to cart popup | v1.1 */
(() => {
  'use strict';

  if (window.__domveliCartPopup) return;
  window.__domveliCartPopup = true;

  let pendingProduct = null;
  let previousFocus = null;
  let popup = null;

  function closePopup() {
    if (!popup || popup.hidden) return;

    popup.hidden = true;
    document.body.classList.remove('dv-cart-open');

    if (previousFocus?.isConnected) {
      previousFocus.focus();
    }
  }

  function createPopup() {
    if (popup) return popup;

    popup = document.createElement('div');
    popup.className = 'dv-cart-overlay';
    popup.hidden = true;

    popup.innerHTML = `
      <section
        class="dv-cart-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dv-cart-title"
        tabindex="-1"
      >
        <button
          type="button"
          class="dv-cart-close"
          aria-label="Zavrieť okno"
        >×</button>

        <div class="dv-cart-success">
          <span class="dv-cart-check" aria-hidden="true">✓</span>
          <span>Úspešne pridané do košíka</span>
        </div>

        <h2 id="dv-cart-title">Produkt je vo vašom košíku</h2>

        <div class="dv-cart-product">
          <div class="dv-cart-image">
            <img alt="" />
          </div>

          <div class="dv-cart-details">
            <strong class="dv-cart-name"></strong>
            <span class="dv-cart-quantity">1 ks</span>
            <strong class="dv-cart-price"></strong>
          </div>
        </div>

        <div class="dv-cart-actions">
          <button type="button" class="dv-cart-continue">
            ← Pokračovať v nákupe
          </button>

          <a class="dv-cart-checkout" href="/kosik/">
            Prejsť do košíka →
          </a>
        </div>
      </section>
    `;

    document.body.appendChild(popup);

    popup.addEventListener('click', event => {
      if (
        event.target === popup ||
        event.target.closest('.dv-cart-close, .dv-cart-continue')
      ) {
        closePopup();
      }
    });

    document.addEventListener('keydown', event => {
      if (popup.hidden) return;

      if (event.key === 'Escape') {
        closePopup();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        popup.querySelectorAll('button:not([disabled]), a[href]')
      );

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    return popup;
  }

  function openPopup(product) {
    const element = createPopup();

    element.querySelector('.dv-cart-name').textContent = product.name;
    element.querySelector('.dv-cart-price').textContent = product.price;

    const image = element.querySelector('.dv-cart-image img');
    const imageBox = element.querySelector('.dv-cart-image');

    imageBox.hidden = !product.image;

    if (product.image) {
      image.src = product.image;
    } else {
      image.removeAttribute('src');
    }

    previousFocus = document.activeElement;
    element.hidden = false;

    document.body.classList.add('dv-cart-open');
    element.querySelector('.dv-cart-close').focus();
  }


/* DOMVELI | Popup pre listing aj detail produktu */

document.addEventListener('click', event => {
  const button = event.target.closest(
    '#products .add-to-cart-button, ' +
    'body.type-product .add-to-cart-button'
  );

  if (!button) return;

  // Produkt na listingu
  const card = button.closest('.p[data-micro="product"]');

  if (card) {
    const image = card.querySelector('a.image img');

    pendingProduct = {
      name: card.querySelector('.name')?.textContent.trim() || 'Produkt',
      price: card.querySelector('.price-final strong')?.textContent.trim() || '',
      image:
        image?.getAttribute('data-src') ||
        image?.currentSrc ||
        image?.src ||
        ''
    };

    return;
  }

  // Detail produktu
  if (document.body.classList.contains('type-product')) {
    const image = document.querySelector(
      '.p-detail .p-image img'
    );

    pendingProduct = {
      name: document.querySelector(
        '.p-detail-inner-header h1, .p-detail h1'
      )?.textContent.trim() || 'Produkt',

      price: document.querySelector(
        '.p-detail .price-final'
      )?.textContent.trim() || '',

      image:
        image?.getAttribute('data-src') ||
        image?.currentSrc ||
        image?.src ||
        ''
    };
  }
}, true);


  document.addEventListener('ShoptetCartAddCartItem', () => {
    if (!pendingProduct) return;

    const product = pendingProduct;
    pendingProduct = null;

    openPopup(product);
  });

  document.addEventListener('ShoptetCartAddCartItemFailed', () => {
    pendingProduct = null;
  });
})();
