/* DOMVELI | Filter na mobile a tablete (DOM-17): polia ceny od–do a aktívne filtre ako čipy.
   Všetko ide cez formuláre a políčka Shoptetu, vlastnú logiku filtrovania nemáme. */
(() => {
  'use strict';

  const num = el => (el ? parseFloat(String(el.value || el.textContent).replace(/\s/g, '').replace(',', '.')) : NaN);
  const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  function priceState() {
    return {
      catMin: num(document.getElementById('categoryMinValue')),
      catMax: num(document.getElementById('categoryMaxValue')),
      min: num(document.getElementById('price-value-min')),
      max: num(document.getElementById('price-value-max'))
    };
  }

  function submitPrice(min, max) {
    const form = document.getElementById('price-filter-form');
    const fMin = document.getElementById('price-value-min');
    const fMax = document.getElementById('price-value-max');
    if (!form || !fMin || !fMax) return;
    fMin.value = Math.round(min);
    fMax.value = Math.round(max);
    form.submit();
  }

  function priceInputs() {
    const slider = document.querySelector('#filters .slider-content');
    if (!slider || document.querySelector('.dv-price-inputs')) return;
    const s = priceState();
    if (isNaN(s.catMin) || isNaN(s.catMax)) return;

    const box = document.createElement('div');
    box.className = 'dv-price-inputs';
    box.innerHTML =
      '<label><span class="sr-only">Cena od</span><input type="number" inputmode="numeric" data-k="min"></label>' +
      '<span aria-hidden="true">–</span>' +
      '<label><span class="sr-only">Cena do</span><input type="number" inputmode="numeric" data-k="max"></label>';
    slider.after(box);

    const [inMin, inMax] = box.querySelectorAll('input');
    [inMin, inMax].forEach(i => { i.min = s.catMin; i.max = s.catMax; });
    const sync = () => {
      const a = num(document.getElementById('min'));
      const b = num(document.getElementById('max'));
      inMin.value = isNaN(a) ? s.min : a;
      inMax.value = isNaN(b) ? s.max : b;
    };
    sync();

    // posúvanie posuvníka Shoptet prepisuje #min/#max, polia ho len nasledujú
    ['min', 'max'].forEach(id => {
      const el = document.getElementById(id);
      if (el) new MutationObserver(sync).observe(el, { childList: true, characterData: true, subtree: true });
    });

    const apply = () => {
      let a = num(inMin), b = num(inMax);
      if (isNaN(a)) a = s.catMin;
      if (isNaN(b)) b = s.catMax;
      a = Math.max(s.catMin, Math.min(a, s.catMax));
      b = Math.max(s.catMin, Math.min(b, s.catMax));
      if (a > b) [a, b] = [b, a];
      const cur = priceState();
      if (Math.round(a) === Math.round(cur.min) && Math.round(b) === Math.round(cur.max)) { sync(); return; }
      submitPrice(a, b);
    };
    [inMin, inMax].forEach(i => {
      i.addEventListener('change', apply);
      i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    });
  }

  function chips() {
    const products = document.getElementById('products');
    if (!products || document.querySelector('.dv-filter-chips')) return;

    const items = [];
    const s = priceState();
    if (!isNaN(s.min) && !isNaN(s.max) && (s.min > s.catMin || s.max < s.catMax)) {
      items.push({ label: Math.round(s.min) + ' – ' + Math.round(s.max) + ' €', off: () => submitPrice(s.catMin, s.catMax) });
    }
    document.querySelectorAll('#filters input[type="checkbox"]:checked').forEach(cb => {
      const label = document.querySelector('label[for="' + CSS.escape(cb.id) + '"]');
      const clone = label && label.cloneNode(true);
      clone && clone.querySelectorAll('.filter-count').forEach(c => c.remove());
      const name = txt(clone) || cb.value;
      items.push({ label: name, off: () => cb.click() });
    });
    if (!items.length) return;

    const box = document.createElement('div');
    box.className = 'dv-filter-chips';
    box.setAttribute('aria-label', 'Aktívne filtre');
    items.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      b.setAttribute('aria-label', 'Zrušiť filter ' + it.label);
      b.addEventListener('click', it.off);
      box.append(b);
    });
    const clear = document.querySelector('#clear-filters a');
    if (clear && items.length > 1) {
      const a = document.createElement('a');
      a.href = clear.getAttribute('href');
      a.textContent = 'Zrušiť všetky';
      box.append(a);
    }
    products.before(box);
  }

  function init() { priceInputs(); chips(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
