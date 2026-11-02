import { loadConfig } from './domveli-config-loader.js?v=1';

function loadFooterStyles() {
  if (document.getElementById('domveli-footer-styles')) {
    return;
  }

  const stylesheet = document.createElement('link');
  stylesheet.id = 'domveli-footer-styles';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./domveli-footer.css?v=1', import.meta.url).href;
  document.head.appendChild(stylesheet);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createLink(href, text) {
  const link = createElement('a', '', text);
  link.href = href;

  return link;
}

function createLinkColumn(title, links) {
  const column = createElement('section', 'dv-footer-column');
  const heading = createElement('h2', 'dv-footer-heading', title);
  const list = createElement('ul', 'dv-footer-links');

  links.forEach(({ label, url }) => {
    const item = createElement('li');
    item.appendChild(createLink(url, label));
    list.appendChild(item);
  });

  column.append(heading, list);
  return column;
}

async function renderFooter() {
  loadFooterStyles();

  const footer = document.getElementById('footer');

  if (!footer || footer.querySelector('.dv-footer-main')) {
    return;
  }

  let DOMVELI_CONFIG;
  try {
    ({ DOMVELI_CONFIG } = await loadConfig());
  } catch (error) {
    console.error('[DOMVELI] Pätička: konfiguráciu sa nepodarilo načítať.', error);
    return;
  }

  const main = createElement('div', 'dv-footer-main');
  const brand = createElement('section', 'dv-footer-column dv-footer-brand');
  const brandName = createElement('a', 'dv-footer-brand-name', 'DOMVELI');
  const description = createElement(
    'p',
    'dv-footer-description',
    (DOMVELI_CONFIG.footer || DOMVELI_CONFIG.story || {}).description || ''
  );
  brandName.href = '/';
  brand.append(brandName, description);

  const categories = DOMVELI_CONFIG.categories.map(category => ({
    label: category.name,
    url: category.url
  }));
  const serviceLinks = [
    { label: 'Obchodné podmienky', url: '/obchodne-podmienky/' },
    {
      label: 'Ochrana osobných údajov',
      url: '/podmienky-ochrany-osobnych-udajov/'
    },
    {
      label: 'Ako nakupovať?',
      url: '/ako-nakupovat/'
    },
    { label: 'DOMVELI magazín', url: '/blog/' }
  ];

  const contact = createElement('section', 'dv-footer-column');
  const contactHeading = createElement(
    'h2',
    'dv-footer-heading',
    'Kontakt'
  );
  const contactDescription = createElement(
    'p',
    'dv-footer-description',
    'Máte otázky? Napíšte nám cez kontaktný formulár.'
  );
  const contactLink = createLink('/kontakty/', 'Otvoriť kontakty →');
  contactLink.className = 'dv-footer-contact-link';
  contact.append(contactHeading, contactDescription, contactLink);

  main.append(
    brand,
    createLinkColumn('Kategórie', categories),
    createLinkColumn('Zákaznícky servis', serviceLinks),
    contact
  );

  const bottom = footer.querySelector('.footer-bottom');
  if (bottom) {
    bottom.insertAdjacentElement('beforebegin', main);
  } else {
    footer.appendChild(main);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFooter, { once: true });
} else {
  renderFooter();
}
