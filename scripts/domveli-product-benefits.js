
/* DOMVELI | Benefity pod nákupným panelom | v3.0 */
(() => {
  'use strict';

  if (!document.body.classList.contains('type-product')) return;

  function init() {
    const benefits = document.querySelector(
      '.benefitBanner.position--benefitProduct'
    );

    const cartPanel = document.querySelector(
      '.p-detail .p-to-cart-block'
    );

    if (!benefits || !cartPanel) return;

    cartPanel.insertAdjacentElement('afterend', benefits);
    benefits.classList.add('dv-product-benefits');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
