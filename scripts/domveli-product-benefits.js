
/* DOMVELI | Benefity pod nákupným panelom | v4.0 */
(() => {
  'use strict';

  if (!document.body.classList.contains('type-product')) return;

  const ICONS = {
    delivery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h11v11H3zM14 9h3.5L21 13v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
    return: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7H4V3M4 7a8 8 0 1 1-1 5"/><path d="M4 7l4-4"/></svg>',
    box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 8 9-5 9 5-9 5zM3 8v9l9 5 9-5V8M12 13v9"/></svg>'
  };

  const ITEMS = [
    ['delivery', 'Doprava od 3,90 €', 'Pri objednávke nad 100 € doprava zdarma'],
    ['card', 'Platba kartou alebo dobierkou', 'Vyber si spôsob platby, ktorý ti vyhovuje'],
    ['return', 'Vrátenie do 14 dní', 'Jednoduché vrátenie tovaru do 14 dní'],
    ['box', 'Odosielame nasledujúci pracovný deň', 'Objednávku vybavíme čo najrýchlejšie']
  ];

  function makeBenefits() {
    const section = document.createElement('section');
    section.className = 'dv-product-benefits';
    section.setAttribute('aria-label', 'Výhody nákupu v Domveli');
    section.innerHTML = ITEMS.map(([icon, title, text]) =>
      '<div class="dv-product-benefits__item">' +
        '<span class="dv-product-benefits__icon">' + ICONS[icon] + '</span>' +
        '<div><strong>' + title + '</strong><span>' + text + '</span></div>' +
      '</div>'
    ).join('');
    return section;
  }

  function init() {
    const cartPanel = document.querySelector('.p-detail .p-to-cart-block');
    if (!cartPanel || document.querySelector('.dv-product-benefits')) return;

    const existing = document.querySelector('.benefitBanner.position--benefitProduct');
    const benefits = existing || makeBenefits();

    cartPanel.insertAdjacentElement('afterend', benefits);
    benefits.classList.add('dv-product-benefits');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
