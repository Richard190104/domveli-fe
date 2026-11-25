/* DOMVELI | Prilepené horné menu pri skrolovaní (počítač) | v1.0
   Hlavička sa posunie hore tak, že na obrazovke ostane len tmavý pás s menu.
   Na mobile je hlavička pevná už teraz, tam sa nič nemení. */
(() => {
  'use strict';

  const MQ = window.matchMedia('(min-width: 992px)');

  function apply() {
    const header = document.getElementById('header');
    const bar = header && header.querySelector('.header-bottom');
    if (!header || !bar) return;

    if (!MQ.matches) {
      header.classList.remove('dv-sticky-menu');
      header.style.removeProperty('top');
      return;
    }

    header.classList.add('dv-sticky-menu');
    header.style.top = -(header.offsetHeight - bar.offsetHeight) + 'px';
  }

  function init() {
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('load', apply);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
