
/* DOMVELI | Benefity pod nákupným panelom | v4.0 */
(() => {
  'use strict';

  if (!document.body.classList.contains('type-product')) return;

  const ICONS = {
    truck: '<rect x="1" y="6" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v3h-7"/><circle cx="5.5" cy="17.5" r="1.8"/><circle cx="18.5" cy="17.5" r="1.8"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    back: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    box: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'
  };

  const ITEMS = [
    ['truck', 'Doprava od 3,90 €', 'Nad 100 € zadarmo'],
    ['card', 'Platba kartou alebo dobierkou', 'Vyberte si, čo vám vyhovuje'],
    ['back', 'Vrátenie do 14 dní', 'Jednoduché vrátenie tovaru'],
    ['box', 'Odosielame nasledujúci pracovný deň', 'Vybavíme čo najrýchlejšie']
  ];

  function init() {
    const cartPanel = document.querySelector('.p-detail .p-image-wrapper') || document.querySelector('.p-detail .p-to-cart-block');
    if (!cartPanel || document.querySelector('.dv-benefits')) return;

    const box = document.createElement('div');
    box.className = 'dv-benefits';
    box.innerHTML = ITEMS.map(([icon, title, text]) =>
      '<div class="dv-benefit">' +
        '<span class="dv-benefit__icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[icon] + '</svg></span>' +
        '<div><p class="dv-benefit__title">' + title + '</p>' +
        '<p class="dv-benefit__text">' + text + '</p></div>' +
      '</div>'
    ).join('');

    const inner = cartPanel.closest('.p-detail-inner');
    if (inner) inner.insertAdjacentElement('afterend', box);
    else cartPanel.insertAdjacentElement('afterend', box);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
