
/* DOMVELI | Cencúle na mieru (konfigurátor) | v1.3
   Spúšťač na detaile cencúľov, popup so zostavou z prepojiteľných sád.
   Zoznam sád je tu; cena a sklad sa pri otvorení načítajú naživo z produktových stránok (záložné hodnoty nižšie). */
(() => {
  'use strict';
  if (window.__domveliCencule) return;
  window.__domveliCencule = true;

  const DATA = [{"id":"tb8","name":"Teplá biela","sub":"8 svetelných režimov","items":[{"code":"CL0201","m":8,"led":200,"price":26.9,"stock":5,"path":"/vianocne-led-cencule-200-led-8-m-tepla-biela/","img":"237_vianocne-led-cencule-200-led--8-m--tepla-biela---svetelna-dekoracia-na-odkvapy-domu.jpg"},{"code":"CL0301","m":12,"led":300,"price":34.9,"stock":3,"path":"/vianocne-led-cencule-12m-300-led-tepla-biela/","img":"584-15_vianocne-led-cencule-springos-cl0301---300-led--12-m--tepla-biela--vonkajsie-vianocne-osvetlenie-ip44.png"},{"code":"CL0501","m":20,"led":500,"price":52.9,"stock":3,"path":"/vianocne-led-cencule-20m-500-led-tepla-biela/","img":"581-64_vianocne-led-cencule-springos-cl0501---500-led--20-m--tepla-biela--vonkajsie-vianocne-osvetlenie-ip44.png"}]},{"id":"sb8","name":"Studená biela","sub":"8 svetelných režimov","items":[{"code":"CL0200","m":8,"led":200,"price":26.9,"stock":4,"path":"/vianocne-led-cencule-200-led-8-m-studena-biela/","img":"240_vianocne-led-cencule-200-led--8-m--studena-biela---vonkajsie-osvetlenie-strechy-domu.jpg"}]},{"id":"tbf","name":"Teplá biela + FLASH","sub":"blikajúce efekty, časovač","items":[{"code":"CL0331","m":12,"led":300,"price":34.9,"stock":3,"path":"/vianocne-led-cencule-300-led-12-m-tepla-biela-flash/","img":"222_vianocne-led-cencule-300-led--12-m--tepla-biela-s-flash-efektom---osvetlenie-domu.png"},{"code":"CL0531","m":21.5,"led":500,"price":52.9,"stock":2,"path":"/vianocne-led-cencule-500-led-21-5-m-tepla-biela-flash/","img":"45-7_led-cencule.jpg"}]},{"id":"sbf","name":"Studená biela + FLASH","sub":"blikajúce efekty, časovač","items":[{"code":"CL0330","m":13,"led":300,"price":34.9,"stock":2,"path":"/vianocne-led-cencule-300-led-13-m-studena-biela-flash/","img":"225_vianocne-led-cencule-300-led--13-m--studena-biela-s-flash-efektom---dekoracia-odkvapov-domu.jpg"},{"code":"CL0530","m":20,"led":500,"price":52.9,"stock":3,"path":"/vianocne-led-cencule-500-led-20-m-studena-biela-casovac/","img":"48-2_vianocne-led-cencule-500-led--20-m--studena-biela-s-flash-efektom---vonkajsie-osvetlenie-domu.jpg"}]},{"id":"tsb","name":"Teplá + studená biela","sub":"prepínanie farby, ovládač","items":[{"code":"CL0332","m":12,"led":300,"price":34.9,"stock":2,"path":"/vianocne-led-cencule-300-led-12-m-tepla-studena-biela-ovladac/","img":"231-1_vianocne-led-cencule-300-led--12-m--tepla-a-studena-biela---svetelna-vyzdoba-strechy-domu.png"},{"code":"CL0532","m":20,"led":500,"price":54.9,"stock":3,"path":"/vianocne-led-cencule-500-led-20-m-tepla-studena-biela/","img":"57_vianocne-led-cencule-500-led--20-m--tepla-a-studena-biela---vianocne-osvetlenie-domu.jpg"}]},{"id":"mcf","name":"Viacfarebné + FLASH","sub":"farebné blikanie","items":[{"code":"CL0319","m":12,"led":300,"price":34.9,"stock":2,"path":"/vianocne-led-cencule-300-led-12-m-viacfarebne-flash/","img":"228_viacfarebne-vianocne-led-cencule-300-led--12-m-s-flash-efektom-na-streche-domu.jpg"},{"code":"CL0519","m":20,"led":500,"price":52.9,"stock":3,"path":"/vianocne-led-cencule-500-led-20-m-viacfarebne-flash/","img":"51-2_viacfarebne-vianocne-cencule-500-led--20-m-s-flash-efektom---svetelna-dekoracia-domu.jpg"}]},{"id":"mdf","name":"Modré + FLASH","sub":"modré blikanie","items":[{"code":"CL0318","m":12,"led":300,"price":34.9,"stock":0,"path":"/vianocne-led-cencule-300-led-12-m-modre-flash/","img":"234-4_modre-vianocne-led-cencule-300-led--12-m--s-flash-efektom-na-streche-domu.jpg"},{"code":"CL0518","m":20,"led":500,"price":52.9,"stock":0,"path":"/vianocne-led-cencule-500-led-20-m-modre-flash/","img":"54-3_modre-vianocne-led-cencule-500-led--20-m-s-flash-efektom---vianocne-osvetlenie-strechy.png"}]}];
  const IMG = 'https://cdn.myshoptet.com/usr/www.domveli.sk/user/shop/related/';

  // ---- pravidlá
  const MAX_CHAIN = 3;   // max. 3 sady za sebou na jeden prívod
  const UNDER_OK = 0.5;  // chýbať môže najviac 0,5 m
  const OVER_OK = 1.0;   // presahovať môže najviac 1 m
  const SHORT_OK = 1.5;  // radšej menej, ak chýba najviac 1,5 m

  function combos(items, L) {
    const out = [];
    const rec = (k, counts) => {
      if (k === items.length) {
        const n = counts.reduce((a, b) => a + b, 0);
        if (!n) return;
        const m = counts.reduce((a, c, i) => a + c * items[i].m, 0);
        const price = counts.reduce((a, c, i) => a + c * items[i].price, 0);
        const ls = counts.some((c, i) => c > items[i].stock) ? 1 : 0;
        out.push({ counts: counts.slice(), m: Math.round(m * 10) / 10, price: Math.round(price * 100) / 100, n, ls, diff: Math.round((m - L) * 10) / 10 });
        return;
      }
      const max = Math.ceil((L + OVER_OK + 25) / items[k].m);
      for (let c = 0; c <= max; c++) {
        counts.push(c);
        const partial = counts.reduce((a, cc, i) => a + cc * items[i].m, 0);
        const ok = partial <= L + 25;
        if (ok) rec(k + 1, counts);
        counts.pop();
        if (!ok) break;
      }
    };
    rec(0, []);
    return out;
  }
  const byCost = (a, b) => a.ls - b.ls || a.price - b.price || a.n - b.n || Math.abs(a.diff) - Math.abs(b.diff);

  function solve(items, L, ignoreStock) {
    let all = combos(items, L);
    if (ignoreStock) all = all.map(c => Object.assign({}, c, { ls: 0 }));
    else {
      const inStock = all.filter(c => !c.ls);
      if (inStock.some(c => c.diff >= -UNDER_OK)) all = inStock;
    }
    const fit = all.filter(c => c.diff >= -UNDER_OK && c.diff <= OVER_OK).sort(byCost);
    const under = all.filter(c => c.diff < -UNDER_OK).sort((a, b) => b.m - a.m || a.ls - b.ls || a.price - b.price)[0] || null;
    const over = all.filter(c => c.diff > OVER_OK).sort((a, b) => a.m - b.m || a.ls - b.ls || a.price - b.price)[0] || null;
    let main, alt = null;
    if (fit.length) main = fit[0];
    else if (!under) main = over;
    else if (!over || (-under.diff <= SHORT_OK && under.price < over.price)) { main = under; alt = over; }
    else if (over.price <= under.price || over.diff <= -under.diff) { main = over; alt = under; }
    else { main = under; alt = over; }
    const deco = c => c && Object.assign({}, c, {
      lines: c.counts.map((q, i) => ({ item: items[i], qty: q })).filter(l => l.qty > 0),
      chains: Math.ceil(c.n / MAX_CHAIN),
      lowStock: c.counts.some((q, i) => q > items[i].stock)
    });
    return { main: deco(main), alt: deco(alt) };
  }

  // ---- živá cena a sklad z produktových stránok (cache 10 min)
  const TTL = 10 * 60 * 1000;
  const live = {};
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function parse(html, code) {
    const out = {};
    const q = new RegExp('"code":\\s*"' + esc(code) + '"[\\s\\S]{0,200}?"quantity":\\s*"(-?[\\d.]+)"').exec(html);
    if (q) out.stock = Math.max(0, Math.floor(parseFloat(q[1]) || 0));
    const p = /itemprop="price"\s+content="([\d.]+)"/.exec(html);
    if (p) out.price = parseFloat(p[1]);
    return out;
  }
  function fromCache(code) {
    try {
      const c = JSON.parse(sessionStorage.getItem('dvcc:' + code) || 'null');
      if (c && Date.now() - c.t < TTL) return c;
    } catch (e) {}
    return null;
  }
  function apply(item, d) {
    if (typeof d.stock === 'number') item.stock = d.stock;
    if (typeof d.price === 'number' && d.price > 0) item.price = d.price;
  }
  function loadFamily(fam) {
    return Promise.all(fam.items.map(item => {
      if (live[item.code]) return live[item.code];
      const c = fromCache(item.code);
      if (c) { apply(item, c); return (live[item.code] = Promise.resolve()); }
      return (live[item.code] = fetch(item.path, { credentials: 'same-origin' })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {
          const d = parse(html, item.code);
          apply(item, d);
          try { sessionStorage.setItem('dvcc:' + item.code, JSON.stringify(Object.assign({ t: Date.now() }, d))); } catch (e) {}
        })
        .catch(() => {}));
    }));
  }

  // aktuálny produkt na detaile: sklad rovno z dataLayer
  const SH = (window.dataLayer && window.dataLayer[0] && window.dataLayer[0].shoptet) || {};
  const curCode = SH.product && SH.product.code;
  if (curCode && SH.product.codes) {
    const it = DATA.flatMap(f => f.items).find(i => i.code === curCode);
    const c = SH.product.codes.find(x => x.code === curCode);
    if (it && c && c.quantity != null) { it.stock = Math.max(0, Math.floor(parseFloat(c.quantity) || 0)); live[curCode] = Promise.resolve(); }
  }

  // ---- UI
  const eur = v => v.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const num = v => (Math.round(v * 10) / 10).toLocaleString('sk-SK');
  const sady = n => n === 1 ? 'sada' : n < 5 ? 'sady' : 'sád';
  const h = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  let fam = DATA[0], L = null, useAlt = false, showOpt = false, last = null, loading = false, root = null, prevFocus = null;
  const $ = s => root.querySelector(s);

  function build() {
    root = document.createElement('div');
    root.className = 'dv-cc';
    root.hidden = true;
    root.innerHTML = `
      <div class="dv-cc__dlg" role="dialog" aria-modal="true" aria-labelledby="dv-cc-t">
        <button type="button" class="dv-cc__x" aria-label="Zavrieť">×</button>
        <div class="dv-cc__cols">
          <div class="dv-cc__left">
            <h2 class="dv-cc__t" id="dv-cc-t">Cencúle na mieru</h2>
            <p class="dv-cc__intro">Zadajte dĺžku strechy alebo odkvapu. Zostavíme ju z prepojiteľných sád za najlepšiu cenu.</p>
            <div class="dv-cc__f"><label for="dv-cc-L">Dĺžka v metroch</label>
              <div class="dv-cc__qty"><button type="button" data-step="-0.5" aria-label="Menej">−</button><input id="dv-cc-L" type="number" inputmode="decimal" min="1" max="300" step="0.5" placeholder="napr. 30"><button type="button" data-step="0.5" aria-label="Viac">+</button></div>
              <div class="dv-cc__chips" role="group" aria-label="Rýchly výber dĺžky">${[10, 20, 30, 40, 60].map(m => `<button type="button" data-len="${m}">${m} m</button>`).join('')}</div>
              <p class="dv-cc__hint">Cencúle sa nedajú skrátiť, presah zavediete za roh.</p></div>
            <div class="dv-cc__f"><label for="dv-cc-fam">Farba a režim</label><select id="dv-cc-fam">${DATA.map((f, i) => `<option value="${i}">${h(f.name)}</option>`).join('')}</select><p class="dv-cc__hint dv-cc__sub"></p></div>
            <div class="dv-cc__f dv-cc__viz"></div>
          </div>
          <div class="dv-cc__right">
            <p class="dv-cc__rl">Vaša zostava</p>
            <div class="dv-cc__res" aria-live="polite"></div>
            <button type="button" class="dv-cc__cta">Pridať celú zostavu do košíka</button>
            <div class="dv-cc__msg"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);

    const inp = $('#dv-cc-L');
    root.addEventListener('click', e => {
      if (e.target === root || e.target.closest('.dv-cc__x')) return close();
      const st = e.target.closest('[data-step]');
      if (st) return setL((L || 0) + parseFloat(st.dataset.step));
      if (e.target.closest('.dv-cc__swap')) { useAlt = !useAlt; return render(); }
      if (e.target.closest('.dv-cc__opt')) { showOpt = !showOpt; useAlt = false; return render(); }
      if (e.target.closest('.dv-cc__cta')) return addAll();
      const chip = e.target.closest('[data-len]');
      if (chip) return setL(Number(chip.dataset.len));
    });
    inp.addEventListener('input', () => {
      const v = parseFloat(String(inp.value).replace(',', '.'));
      if (v > 0 && v <= 300) { L = v; useAlt = false; showOpt = false; render(); }
      else if (String(inp.value).trim() === '') { L = null; render(); }
    });
    inp.addEventListener('change', () => setL(parseFloat(String(inp.value).replace(',', '.'))));
    $('#dv-cc-fam').addEventListener('change', e => { fam = DATA[+e.target.value]; useAlt = false; showOpt = false; refresh(); });
    document.addEventListener('keydown', e => { if (!root.hidden && e.key === 'Escape') close(); });
  }

  function setL(v) {
    if (isNaN(v)) { if (String($('#dv-cc-L').value).trim() === '') { L = null; render(); } return; }
    v = Math.max(1, Math.min(300, Math.round(v * 2) / 2 || 1));
    $('#dv-cc-L').value = v;
    if (v === L) return;
    L = v; useAlt = false; showOpt = false; render();
  }

  function refresh() {
    loading = true; render();
    const f = fam;
    loadFamily(f).then(() => { if (f === fam) { loading = false; render(); } });
  }

  function render() {
    $('.dv-cc__sub').textContent = fam.sub;
    root.querySelectorAll('[data-len]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.len) === L)));
    const cta = $('.dv-cc__cta');
    if (!L) {
      $('.dv-cc__viz').innerHTML = '';
      $('.dv-cc__res').innerHTML = '<p class="dv-cc__empty">Zadajte dĺžku, ktorú chcete osvetliť, a tu sa zobrazí zostava s cenou.</p>';
      cta.disabled = true; cta.textContent = 'Pridať celú zostavu do košíka';
      $('.dv-cc__msg').textContent = '';
      return;
    }
    const items = fam.items;
    const rs = solve(items, L, false), ro = solve(items, L, true);
    const same = (a, b) => a && b && a.counts.join() === b.counts.join();
    const optDiffers = ro.main.lowStock && !same(rs.main, ro.main);
    if (!optDiffers) showOpt = false;
    const r = showOpt ? ro : rs;
    last = r;
    const c = useAlt && r.alt ? r.alt : r.main;
    let o = useAlt && r.alt ? r.main : r.alt;
    if (o && !useAlt && o.m < c.m && o.price >= c.price) o = null;

    let bar = '', k = 0;
    for (const l of c.lines) for (let q = 0; q < l.qty; q++) {
      if (k && k % MAX_CHAIN === 0) bar += '<div class="dv-cc__gap"></div>';
      bar += `<div class="dv-cc__seg" style="flex:${l.item.m}"></div>`; k++;
    }
    if (c.m < L) bar += `<div class="dv-cc__seg dv-cc__seg--miss" style="flex:${L - c.m}"></div>`;
    const d = Math.round((c.m - L) * 10) / 10;
    const status = d === 0 ? 'presne na mieru' : d > 0 ? `presah ${num(d)} m` : `chýba ${num(-d)} m`;
    $('.dv-cc__sub').textContent = fam.sub;
    $('.dv-cc__viz').innerHTML = `<span class="dv-cc__lbl">Rozloženie sád</span><div class="dv-cc__track">${bar}</div><div class="dv-cc__scale"><span>0 m</span><span>${num(c.m)} m · ${status}</span></div>`;

    let html = `<ul class="dv-cc__items">${c.lines.map(l => {
      const s = l.item.stock;
      const av = s >= l.qty ? `<span class="dv-cc__ok">Skladom</span> (${s} ks)` : s > 0 ? `<span class="dv-cc__no">Skladom len ${s} ks</span>` : '<span class="dv-cc__no">Nie je skladom</span>';
      return `<li><img src="${IMG + l.item.img}" alt="" loading="lazy" width="72" height="54"><div class="dv-cc__tx"><a href="${l.item.path}">${l.qty}× ${h(fam.name)}, ${num(l.item.m)} m, ${l.item.led} LED</a><div class="dv-cc__av">${loading ? 'Overujem dostupnosť…' : av} · ${l.item.code}</div></div><span class="dv-cc__p">${eur(l.qty * l.item.price)}</span></li>`;
    }).join('')}</ul>`;
    html += `<div class="dv-cc__total"><span>Spolu ${c.n} ${sady(c.n)}</span><span class="dv-cc__price">${eur(c.price)}</span></div>`;

    const notes = [];
    if (c.chains > 1) notes.push(`Za sebou sa dajú prepojiť najviac ${MAX_CHAIN} sady. Zostavu preto zapojte do <b>${c.chains} zásuviek</b>.`);
    else if (c.n > 1) notes.push('Všetky sady prepojíte za sebou a zapojíte do jednej zásuvky.');
    if (d < 0) notes.push(`Na posledných ${num(-d)} m cencúle nebudú.`);
    if (d > 1) notes.push(`Zostava je o ${num(d)} m dlhšia, presah môžete zaviesť za roh alebo na bok domu.`);
    if (!loading && c.lowStock && !showOpt) notes.push('<span class="dv-cc__no">Tento typ nemáme skladom v potrebnom množstve.</span>');
    if (notes.length) html += `<div class="dv-cc__note">${notes.join(' ')}</div>`;

    if (!loading && optDiffers) html += showOpt
      ? '<div class="dv-cc__box dv-cc__box--warn"><span>Táto kombinácia nie je celá skladom.</span><button type="button" class="dv-cc__btn dv-cc__opt">Späť na dostupnú</button></div>'
      : `<div class="dv-cc__box dv-cc__box--warn"><span>Najvýhodnejšia kombinácia <b>${ro.main.lines.map(l => l.qty + '× ' + num(l.item.m) + ' m').join(' + ')}</b> za <b>${eur(ro.main.price)}</b> momentálne nie je skladom.</span><button type="button" class="dv-cc__btn dv-cc__opt">Zobraziť</button></div>`;
    if (o && !showOpt) {
      const od = Math.round((o.m - L) * 10) / 10;
      const lbl = useAlt ? 'Pôvodný návrh' : (o.m > c.m ? 'Chcete pokryť celú dĺžku?' : 'Chcete radšej kratšie?');
      html += `<div class="dv-cc__box"><span>${lbl} <b>${num(o.m)} m</b> (${od >= 0 ? '+' + num(od) : '−' + num(-od)} m) za <b>${eur(o.price)}</b></span><button type="button" class="dv-cc__btn dv-cc__swap">${useAlt ? 'Späť' : 'Vybrať'}</button></div>`;
    }
    $('.dv-cc__res').innerHTML = html;

    cta.disabled = loading || c.lowStock;
    cta.textContent = loading ? 'Overujem dostupnosť…' : c.lowStock ? 'Zostava nie je skladom' : 'Pridať celú zostavu do košíka';
    $('.dv-cc__msg').textContent = '';
  }

  // pridanie: po jednej sade, čaká sa na udalosť Shoptetu
  function addOne(code, amount) {
    return new Promise(resolve => {
      let done = false;
      const fin = ok => { if (done) return; done = true; document.removeEventListener('ShoptetCartAddCartItem', okH); document.removeEventListener('ShoptetCartAddCartItemFailed', noH); resolve(ok); };
      const okH = () => fin(true), noH = () => fin(false);
      document.addEventListener('ShoptetCartAddCartItem', okH);
      document.addEventListener('ShoptetCartAddCartItemFailed', noH);
      try { window.shoptet.cartShared.addToCart({ productCode: code, amount }, true); } catch (e) { fin(false); }
      setTimeout(() => fin(true), 6000);
    });
  }
  async function addAll() {
    const c = useAlt && last.alt ? last.alt : last.main;
    if (c.lowStock) return;
    const cta = $('.dv-cc__cta'), msg = $('.dv-cc__msg');
    if (!(window.shoptet && shoptet.cartShared && shoptet.cartShared.addToCart)) { msg.textContent = 'Košík sa nepodarilo načítať, skúste obnoviť stránku.'; return; }
    cta.disabled = true; cta.textContent = 'Pridávam do košíka…';
    for (const l of c.lines) {
      const ok = await addOne(l.item.code, l.qty);
      if (!ok) { msg.textContent = 'Niektorú sadu sa nepodarilo pridať. Skontrolujte prosím košík.'; msg.style.color = 'var(--cc-warn)'; cta.disabled = false; cta.textContent = 'Skúsiť znova'; return; }
    }
    close();
    const first = c.lines[0].item;
    if (window.DomveliCartPopup && window.DomveliCartPopup.open) {
      window.DomveliCartPopup.open({
        title: 'Zostava je vo vašom košíku',
        name: 'Cencúle na mieru – ' + fam.name + ', spolu ' + num(c.m) + ' m',
        quantity: c.lines.map(l => l.qty + '× ' + num(l.item.m) + ' m').join(' + ') + ' (' + c.n + ' ' + sady(c.n) + ')',
        price: eur(c.price),
        image: IMG + first.img
      });
    } else location.href = '/kosik/';
    cta.disabled = false; cta.textContent = 'Pridať celú zostavu do košíka';
  }

  function open(preset) {
    if (!root) build();
    if (preset) { fam = preset; useAlt = false; showOpt = false; }
    $('#dv-cc-fam').value = String(DATA.indexOf(fam));
    $('#dv-cc-L').value = L == null ? '' : L;
    prevFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add('dv-cc-open');
    refresh();
    setTimeout(() => $('#dv-cc-L').focus(), 0);
  }
  function close() {
    root.hidden = true;
    document.body.classList.remove('dv-cc-open');
    if (prevFocus && prevFocus.isConnected) prevFocus.focus();
  }

  function trigger(preset, title, sub) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dv-cc-trigger';
    b.innerHTML = `<span class="dv-cc-trigger__ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="8" y="5.5" width="8" height="3.5" rx=".5"/><path d="M8.5 12.5h.01M12 12.5h.01M15.5 12.5h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5v3M8.5 18.5h.01M12 18.5h.01"/></svg></span><span class="dv-cc-trigger__tx"><b>${title}</b><span>${sub}</span></span><i>Vypočítať</i>`;
    b.addEventListener('click', () => open(preset));
    return b;
  }

  function init() {
    const body = document.body.classList;
    // detail cencúľa
    if (body.contains('type-product') && curCode) {
      const f = DATA.find(x => x.items.some(i => i.code === curCode));
      if (f) {
        // počítač: pod galériou vľavo, mobil: pod nákupným panelom
        const el = trigger(f, 'Cencúle na mieru', 'Zadajte dĺžku, zvyšok vyrátame za vás');
        const mq = window.matchMedia('(min-width: 768px)');
        const place = () => {
          const gal = document.querySelector('.p-detail .p-image-wrapper');
          const cart = document.querySelector('.p-detail .p-to-cart-block') || document.querySelector('.p-detail-inner-header');
          if (mq.matches && gal) gal.appendChild(el);
          else if (cart) cart.insertAdjacentElement('afterend', el);
        };
        place();
        if (mq.addEventListener) mq.addEventListener('change', place);
      }
    }
    // ľubovoľné miesto: <div data-dv-cencule></div>
    document.querySelectorAll('[data-dv-cencule]').forEach(el => {
      if (!el.querySelector('.dv-cc-trigger')) el.appendChild(trigger(null, 'Cencúle na mieru', 'Zadajte dĺžku strechy a zostavíme vám ju z prepojiteľných sád'));
    });
  }

  // Ponuka na homepage vysúvaná z pravého okraja: po zatvorení (alebo otvorení kalkulačky) sa už nezobrazí
  const TOAST_KEY = 'dv-cc-toast-off';
  function toast() {
    // len na hlavnej stránke
    if (!document.body.classList.contains('in-index')) return;
    try { if (localStorage.getItem(TOAST_KEY)) return; } catch (e) { return; }

    const el = document.createElement('aside');
    el.className = 'dv-cc-toast';
    el.setAttribute('aria-label', 'Cencúle na mieru');
    el.innerHTML =
      '<div class="dv-cc-toast__img"><img src="https://richard190104.github.io/domveli-be/images/svetelne-zavesy.webp" alt="" width="380" height="170" loading="lazy">' +
      '<span class="dv-cc-toast__badge">Novinka</span></div>' +
      '<div class="dv-cc-toast__tx"><span class="dv-cc-toast__k">Cencúle na mieru</span>' +
      '<strong>Presne na dĺžku vašej strechy</strong>' +
      '<p>Zadajte metre a zostavu z prepojiteľných sád aj s cenou vyrátame za vás.</p>' +
      '<button type="button" class="dv-cc-toast__go">Vypočítať zostavu <span aria-hidden="true">→</span></button></div>' +
      '<button type="button" class="dv-cc-toast__x" aria-label="Zavrieť a viac nezobrazovať">×</button>';
    document.body.appendChild(el);

    const off = () => {
      try { localStorage.setItem(TOAST_KEY, '1'); } catch (e) {}
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 400);
    };
    el.querySelector('.dv-cc-toast__x').addEventListener('click', off);
    el.querySelector('.dv-cc-toast__go').addEventListener('click', () => { off(); open(null); });
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  }
  const showToast = () => setTimeout(() => {
    if (document.body.classList.contains('dv-cc-open') || document.body.classList.contains('dv-popup-open') || document.body.classList.contains('dv-cart-open')) return;
    toast();
  }, 2000);
  if (document.readyState === 'complete') showToast();
  else window.addEventListener('load', showToast);

  // Odkaz kdekoľvek na webe (napr. banner na homepage) otvorí kalkulačku: href="#cencule-na-mieru"
  const HASH = '#cencule-na-mieru';
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href$="' + HASH + '"]');
    if (!a) return;
    e.preventDefault();
    open(null);
  });
  if (location.hash === HASH) {
    const openFromHash = () => open(null);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openFromHash);
    else openFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
