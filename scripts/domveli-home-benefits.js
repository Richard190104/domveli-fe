/* DOMVELI | Pásik istôt pod horným menu (homepage) | v1.0 */
(() => {
  'use strict';

  if (!document.body.classList.contains('in-index')) return;

  const ICONS = {
    truck: '<rect x="1" y="6" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v3h-7"/><circle cx="5.5" cy="17.5" r="1.8"/><circle cx="18.5" cy="17.5" r="1.8"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    back: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    box: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'
  };

  const ITEMS = [
    ['truck', 'Doprava od 3,90 €', 'Nad 60 € zadarmo'],
    ['card', 'Platba kartou alebo dobierkou', 'Vyberte si, čo vám vyhovuje'],
    ['back', 'Vrátenie do 14 dní', 'Jednoduché vrátenie tovaru'],
    ['box', 'Odosielame nasledujúci pracovný deň', 'Vybavíme čo najrýchlejšie']
  ];

  function init() {
    if (document.querySelector('.dv-trust-strip')) return;
    const anchor = document.querySelector('#domveli-home > .dv-promo-banners');
    if (!anchor) return;

    const strip = document.createElement('div');
    strip.className = 'dv-trust-strip';
    strip.innerHTML = '<ul class="dv-trust-strip__list">' + ITEMS.map(([icon, title, text]) =>
      '<li class="dv-trust-strip__item">' +
        '<span class="dv-trust-strip__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[icon] + '</svg></span>' +
        '<span class="dv-trust-strip__txt"><strong>' + title + '</strong><small>' + text + '</small></span>' +
      '</li>'
    ).join('') + '</ul>';

    anchor.insertAdjacentElement('afterend', strip);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
