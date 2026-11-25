/* DOMVELI | Prilepené horné menu pri skrolovaní (počítač) | v1.0
   Hlavička sa posunie hore tak, že na obrazovke ostane len tmavý pás s menu.
   Na mobile je hlavička pevná už teraz, tam sa nič nemení. */
(() => {
  'use strict';

  const MQ = window.matchMedia('(min-width: 992px)');

  function apply() {
    const header = document.getElementById('header');
    const bar = header && header.querySelector('.header-bottom');
    if (!header || !bar) return;

    if (!MQ.matches) {
      header.classList.remove('dv-sticky-menu');
      header.style.removeProperty('top');
      return;
    }

    header.classList.add('dv-sticky-menu');
    header.style.top = -(header.offsetHeight - bar.offsetHeight) + 'px';
    ensureCart();
    onScroll();
  }

  /* Košík v prilepenom páse: zobrazí sa, keď horný košík odíde z obrazovky.
     Údaje (suma, počet kusov) berie z pôvodného košíka v hlavičke. */
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 13H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  let cartLink = null;

  function sourceCart() {
    return document.querySelector('#header .navigation-buttons .cart-count') || document.querySelector('#header .cart-count');
  }

  function syncCart() {
    const src = sourceCart();
    if (!cartLink || !src) return;
    const priceEl = src.querySelector('.cart-price');
    const priceTxt = priceEl ? priceEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const hasPrice = /\d/.test(priceTxt) && !/pr[aá]zdn/i.test(priceTxt);
    const countEl = src.querySelector('[data-testid="headerCartCount"], i, .cart-count-number');
    const count = countEl ? countEl.textContent.replace(/\D+/g, '') : '';
    const badge = count && count !== '0' ? '<b>' + count + '</b>' : '';
    const html = '<span class="dv-sc-ic">' + ICON + badge + '</span><span class="dv-sc-txt">Košík' +
      (hasPrice ? ' <span class="dv-sc-price">' + priceTxt.replace(/</g, '') + '</span>' : '') + '</span>';
    if (cartLink.innerHTML !== html) cartLink.innerHTML = html;
  }

  function ensureCart() {
    if (cartLink) return;
    const wrap = document.querySelector('#header .header-bottom-wrapper');
    const src = sourceCart();
    if (!wrap || !src) return;
    cartLink = document.createElement('a');
    cartLink.className = 'dv-sticky-cart';
    cartLink.href = src.getAttribute('href') || '/kosik/';
    cartLink.rel = 'nofollow';
    cartLink.setAttribute('aria-label', 'Nákupný košík');
    wrap.appendChild(cartLink);
    syncCart();
    new MutationObserver(syncCart).observe(src, { childList: true, subtree: true, characterData: true });
  }

  function onScroll() {
    const header = document.getElementById('header');
    const bar = header && header.querySelector('.header-bottom');
    if (!cartLink || !header || !bar) return;
    const hidden = header.offsetHeight - bar.offsetHeight;
    const show = MQ.matches && header.getBoundingClientRect().top <= -hidden + 1;
    cartLink.classList.toggle('is-visible', show);
  }

  function init() {
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('load', apply);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
