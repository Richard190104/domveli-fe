(function () {
  'use strict';

  /* ============================================================
     DOMVELI – ZDIEĽANIE ČLÁNKOV
     Pridá pod článok blogu tlačidlá na zdieľanie.
     ============================================================ */

  const STYLE_ID = 'domveli-share-styles';

  const CSS = `
    .dv-share {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin: 36px 0 36px;
      padding: 22px 0 28px;
      border-top: 1px solid #e9e1d7;
      border-bottom: 1px solid #e9e1d7;
      font-family: Arial, Helvetica, sans-serif;
    }
    .dv-share-label {
      margin-right: 6px;
      color: #b18a52;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .dv-share-button {
      display: inline-block;
      padding: 11px 18px;
      border: 1px solid #c99a56;
      background: #fff;
      color: #a7793c !important;
      font: 700 12px/1 Arial, Helvetica, sans-serif;
      letter-spacing: 1px;
      text-decoration: none !important;
      cursor: pointer;
      transition: background .2s, color .2s;
    }
    .dv-share-button:hover,
    .dv-share-button:focus-visible {
      background: #c99a56;
      color: #211913 !important;
    }
    @media (max-width: 600px) {
      .dv-share-label { flex: 0 0 100%; margin-bottom: 4px; }
    }
  `;

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function button(text, label, href) {
    const el = document.createElement(href ? 'a' : 'button');

    el.className = 'dv-share-button';
    el.textContent = text;
    el.setAttribute('aria-label', label);

    if (href) {
      el.href = href;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.type = 'button';
    }

    return el;
  }

  function initShare() {
    const body = document.body;
    const detail = document.querySelector('.news-item-detail');

    // Iba detail článku, nie výpis blogu.
    if (!body.classList.contains('in-blog') ||
        !body.classList.contains('type-post') ||
        !detail ||
        document.querySelector('.dv-share')) {
      return;
    }

    addStyles();

    const url = location.origin + location.pathname;
    const title = (document.querySelector('h1')?.textContent || document.title).trim();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const box = document.createElement('div');
    box.className = 'dv-share';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Zdieľať článok');

    const label = document.createElement('span');
    label.className = 'dv-share-label';
    label.textContent = 'Zdieľať článok';
    box.appendChild(label);

    // Natívne zdieľanie (mobily), ak ho prehliadač podporuje.
    if (navigator.share) {
      const nativeButton = button('Zdieľať', 'Zdieľať článok');
      nativeButton.addEventListener('click', () => {
        navigator.share({ title, url }).catch(() => {});
      });
      box.appendChild(nativeButton);
    }

    box.append(
      button('Facebook', 'Zdieľať na Facebooku',
        'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl),
      button('WhatsApp', 'Zdieľať cez WhatsApp',
        'https://wa.me/?text=' + encodedTitle + '%20' + encodedUrl),
      button('E-mail', 'Poslať e-mailom',
        'mailto:?subject=' + encodedTitle + '&body=' + encodedUrl)
    );

    const copy = button('Kopírovať odkaz', 'Kopírovať odkaz na článok');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        copy.textContent = 'Odkaz skopírovaný';
      } catch (error) {
        window.prompt('Skopírujte odkaz:', url);
      }

      setTimeout(() => { copy.textContent = 'Kopírovať odkaz'; }, 2000);
    });
    box.appendChild(copy);

    // Pod text článku, nad odkazy Predchádzajúci / Ďalší článok.
    const article = detail.querySelector('article');
    const text = article && article.querySelector('.text');

    if (text) {
      text.insertAdjacentElement('afterend', box);
    } else {
      detail.appendChild(box);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShare);
  } else {
    initShare();
  }
})();
