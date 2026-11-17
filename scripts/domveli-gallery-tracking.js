/* DOMVELI | Sledovanie klikov v galérii produktu (Google Analytics) | v1.0 */
(() => {
  'use strict';

  if (!document.body.classList.contains('type-product')) return;

  function productInfo() {
    try {
      const layer = window.dataLayer || [];
      for (let i = 0; i < layer.length; i++) {
        const p = layer[i] && layer[i].shoptet && layer[i].shoptet.product;
        if (p) return { id: p.code || '', name: p.name || '' };
      }
    } catch (e) {}
    return { id: '', name: document.title };
  }

  function send(action) {
    if (typeof window.gtag !== 'function') return;
    const p = productInfo();
    try {
      window.gtag('event', 'gallery_interaction', {
        send_to: 'GA4',
        gallery_action: action,
        item_id: p.id,
        item_name: p.name
      });
    } catch (e) {}
  }

  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;
    if (t.closest('.p-thumbnails a.p-thumbnail')) send('thumbnail');
    else if (t.closest('.p-thumbnails .next-thumbnail, .p-thumbnails .prev-thumbnail, .p-thumbnails-wrapper .shp-thumb-next, .p-thumbnails-wrapper .shp-thumb-prev')) send('arrow');
    else if (t.closest('.p-detail .p-image a, .p-detail .p-main-image')) send('main_image');
  }, true);
})();
