/* DOMVELI | Pásik úplne hore: darček k nákupu nad 80 € | v1.0
   Darček je nastavený v Shoptete (Produkty > Darčeky, produkt „Darček prekvapenie“). */
(() => {
  'use strict';

  const TEXT = '<b>Darček zadarmo</b> k nákupu nad 80 €';
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13"/><path d="M3 12h18M12 8v13"/><path d="M12 8C10 4 6 4 6 6.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z"/></svg>';

  function init() {
    if (document.querySelector('.dv-gift-bar')) return;

    const anchor = document.querySelector('.overall-wrapper > .top-navigation-bar') ||
      document.getElementById('header');
    if (!anchor) return;

    const bar = document.createElement('div');
    bar.className = 'dv-gift-bar';
    bar.innerHTML = ICON + '<span>' + TEXT + '</span>';
    anchor.insertAdjacentElement('beforebegin', bar);

    // Prilepené menu počíta výšku hlavičky, nech sa prepočíta.
    window.dispatchEvent(new Event('resize'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
