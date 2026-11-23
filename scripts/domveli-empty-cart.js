/* DOMVELI | Prázdny košík (DOM-9): prázdny stav, kategórie ako karty a kontakt */
(() => {
  'use strict';

  const ICON = {
    bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    mail: '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'
  };
  const svg = name => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Obrázok a podkategórie kategórie z megamenu (rovnaké obrázky ako v navigácii)
  function fromMenu(href) {
    const link = [...document.querySelectorAll('#navigation .menu-level-1 > li > a')]
      .find(a => a.getAttribute('href') === href);
    const li = link && link.parentElement;
    if (!li) return { img: '', subs: [] };
    const img = li.querySelector('.menu-level-2 img');
    const subs = [...li.querySelectorAll('.menu-level-2 > li > div > a, .menu-level-2 > li > a')]
      .map(a => a.textContent.trim()).filter(Boolean);
    return { img: img ? img.getAttribute('data-src') || img.getAttribute('src') || '' : '', subs };
  }

  function init() {
    const cart = document.querySelector('.cart-inner.cart-empty');
    if (!cart || cart.querySelector('.dv-empty')) return;

    const cats = [...cart.querySelectorAll('.empty-cart-boxes ul a')].map(a => {
      const href = a.getAttribute('href');
      const m = fromMenu(href);
      return { href, name: a.textContent.trim(), img: m.img, sub: m.subs.slice(0, 3).join(', ') };
    });

    const box = cart.querySelector('.contact-box');
    const mail = box && box.querySelector('.mail a');
    const tel = box && box.querySelector('.tel a');

    const el = document.createElement('div');
    el.className = 'dv-empty';
    el.innerHTML =
      '<div class="dv-empty__hero">' +
        '<span class="dv-empty__icon">' + svg('bag') + '</span>' +
        '<h1 class="dv-empty__title">Váš košík je zatiaľ prázdny</h1>' +
        '<p class="dv-empty__text">Pozrite sa na našu vianočnú ponuku alebo si vyberte z hotových setov.</p>' +
        '<a class="dv-empty__cta" href="/">Pokračovať v nákupe <span aria-hidden="true">→</span></a>' +
      '</div>' +
      (cats.length ? '<ul class="dv-empty__cats">' + cats.map(c =>
        '<li><a href="' + esc(c.href) + '">' +
          (c.img ? '<img src="' + esc(c.img) + '" alt="" width="140" height="100" loading="lazy">' : '') +
          '<span><strong>' + esc(c.name) + '</strong>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</span>' +
        '</a></li>').join('') + '</ul>' : '') +
      (mail || tel ? '<div class="dv-empty__help"><strong>Potrebujete poradiť?</strong>' +
        (mail ? '<a href="' + esc(mail.getAttribute('href')) + '">' + svg('mail') + esc(mail.textContent.trim()) + '</a>' : '') +
        (tel ? '<a href="' + esc(tel.getAttribute('href')) + '">' + svg('phone') + esc(tel.textContent.trim()) + '</a>' : '') +
      '</div>' : '');

    // Pôvodný obsah Shoptetu len skryjeme (nadpis ostáva pre čítačky v sr-only h1 stránky)
    cart.querySelectorAll(':scope > .cart-heading, :scope > .cart-row').forEach(n => { n.hidden = true; });
    cart.append(el);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
