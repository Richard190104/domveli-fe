/* DOMVELI | Mobilné menu (DOM-14): doplní Registráciu a kontakt pod Prihlásenie */
(() => {
  'use strict';

  const CONTACT = [
    ['mail', 'mailto:domveli@domveli.sk', 'domveli@domveli.sk'],
    ['phone', 'tel:+421907476291', '+421 907 476 291']
  ];
  const ICON = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plus: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 11-7.4M19 15v6M16 18h6"/>',
    mail: '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'
  };
  const svg = n => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>';

  function item(icon, href, text, cls) {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');
    if (cls) li.className = cls;
    const a = document.createElement('a');
    a.href = href;
    a.setAttribute('role', 'menuitem');
    a.innerHTML = svg(icon) + '<span></span>';
    a.lastChild.textContent = text;
    li.append(a);
    return li;
  }

  function init() {
    const list = document.querySelector('#navigation .navigationActions');
    if (!list || list.querySelector('.dv-nav-contact')) return;

    // ikona k existujúcim odkazom účtu (Prihlásenie / Môj účet)
    list.querySelectorAll(':scope > li > a').forEach(a => {
      if (!a.querySelector('svg')) a.insertAdjacentHTML('afterbegin', svg('user'));
    });

    // Registrácia z horného pruhu (zobrazí sa len neprihláseným, rovnako ako tam)
    const reg = document.querySelector('.top-navigation-bar a[href*="registr"]');
    if (reg && !list.querySelector('a[href*="registr"]')) {
      list.append(item('plus', reg.getAttribute('href'), reg.textContent.trim() || 'Registrácia'));
    }

    CONTACT.forEach(([icon, href, text], i) => list.append(item(icon, href, text, i === 0 ? 'dv-nav-contact' : 'dv-nav-contact dv-nav-contact--next')));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
