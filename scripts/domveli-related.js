/* DOMVELI | Podobné produkty na detaile (DOM-8): nadpis so šípkami a posúvanie pásu kariet */
(() => {
  'use strict';

  const ARROW = d => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';

  function init() {
    const title = document.querySelector('.p-detail .products-alternative-header');
    const old = document.querySelector('.p-detail .products-alternative');
    if (!title || !old || title.closest('.dv-related-head')) return;

    // Slider Shoptetu (pevné šírky, ťahanie myšou) nahradíme čistou kópiou bez jeho listenerov.
    // Pridanie do košíka Shoptet rieši cez delegované udalosti, takže na kópii funguje.
    const list = old.cloneNode(true);
    list.classList.remove('product-slider');
    list.removeAttribute('style');
    const track = list.querySelector('.products-block');
    if (!track) return;
    track.removeAttribute('style');

    // Na mobile slider pridá kópie kariet na začiatok aj koniec (nekonečné točenie). Necháme len originály v strede.
    const cards = [...track.querySelectorAll(':scope > .product')];
    const ids = cards.map(c => c.querySelector('[data-micro-product-id]')?.dataset.microProductId || c.innerText);
    const unique = new Set(ids).size;
    const extra = (cards.length - unique) / 2;
    if (extra > 0 && Number.isInteger(extra)) {
      cards.forEach((c, i) => { if (i < extra || i >= extra + unique) c.remove(); });
    }
    track.querySelectorAll(':scope > .product').forEach(c => c.removeAttribute('style'));
    old.replaceWith(list);

    const head = document.createElement('div');
    head.className = 'dv-related-head';
    title.before(head);

    const text = document.createElement('div');
    text.innerHTML = '<span class="dv-related-kicker">Mohlo by sa vám hodiť</span>';
    text.append(title);

    const nav = document.createElement('div');
    nav.className = 'dv-related-nav';
    nav.innerHTML =
      '<button type="button" data-dir="-1" aria-label="Predchádzajúce produkty">' + ARROW('M15 6l-6 6 6 6') + '</button>' +
      '<button type="button" data-dir="1" aria-label="Ďalšie produkty">' + ARROW('M9 6l6 6-6 6') + '</button>';
    head.append(text, nav);

    const [prev, next] = nav.querySelectorAll('button');
    const step = () => {
      const card = track.querySelector('.product');
      return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      nav.hidden = max <= 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };

    nav.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);
})();
