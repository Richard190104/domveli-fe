/* DOMVELI | Pásik úplne hore: darček k nákupu nad 80 € | v1.1
   Darček je nastavený v Shoptete (Produkty > Darčeky, produkt „Darček prekvapenie“).
   Počítač: pásik je nad hlavičkou a odroluje sa so stránkou.
   Mobil (hlavička je pevná): pásik je pripevnený nad hlavičkou, po zrolovaní sa schová. */
(() => {
  'use strict';

  const TEXT = '<b>Darček zadarmo</b> k nákupu nad 80 €';
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13"/><path d="M3 12h18M12 8v13"/><path d="M12 8C10 4 6 4 6 6.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/></svg>';

  let bar = null;
  let mobile = false;

  function header() {
    return document.getElementById('header');
  }

  function setOffset(px) {
    const h = header();
    if (!h) return;
    const nav = h.querySelector('#navigation');
    h.style.setProperty('top', px + 'px', 'important');
    if (nav) nav.style.setProperty('top', (h.offsetHeight + px) + 'px', 'important');
  }

  function clearOffset() {
    const h = header();
    if (!h) return;
    const nav = h.querySelector('#navigation');
    if (nav) nav.style.removeProperty('top');
    const wrap = document.querySelector('.overall-wrapper');
    if (wrap) wrap.style.removeProperty('padding-top');
  }

  function onScroll() {
    if (!mobile || !bar) return;
    const hidden = window.scrollY > bar.offsetHeight;
    bar.classList.toggle('is-hidden', hidden);
    setOffset(hidden ? 0 : bar.offsetHeight);
  }

  function layout() {
    const h = header();
    if (!bar || !h) return;
    const wasMobile = mobile;
    bar.classList.remove('is-fixed');
    mobile = window.innerWidth < 992 && getComputedStyle(h).position === 'fixed';

    if (!mobile) {
      bar.classList.remove('is-hidden');
      if (wasMobile) {
        clearOffset();
        // Prilepené menu si „top“ hlavičky nastaví znova.
        h.style.removeProperty('top');
        window.dispatchEvent(new Event('resize'));
      }
      return;
    }

    bar.classList.add('is-fixed');
    const wrap = document.querySelector('.overall-wrapper');
    if (wrap) wrap.style.paddingTop = bar.offsetHeight + 'px';
    onScroll();
  }

  function init() {
    if (document.querySelector('.dv-gift-bar')) return;

    const anchor = document.querySelector('.overall-wrapper > .top-navigation-bar') || header();
    if (!anchor) return;

    bar = document.createElement('div');
    bar.className = 'dv-gift-bar';
    bar.innerHTML = ICON + '<span>' + TEXT + '</span>';
    anchor.insertAdjacentElement('beforebegin', bar);

    layout();
    // Prilepené menu (počítač) počíta výšku hlavičky, nech sa prepočíta.
    window.dispatchEvent(new Event('resize'));
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
