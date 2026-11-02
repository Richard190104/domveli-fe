
import {
  createCarousel,
  createFadeCarousel
} from './domveli-carousel.js?v=2';

import { loadConfig } from './domveli-config-loader.js?v=1';

/* ============================================================
   DOMVELI – VYKRESĽOVANIE TITULNEJ STRÁNKY
   ============================================================ */

(function () {
  'use strict';

  let DOMVELI_CONFIG;

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function append(parent, ...children) {
    children.forEach(child => parent.appendChild(child));
    return parent;
  }

  function image(src, alt, className) {
    const img = node('img', className);
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    return img;
  }

  function link(href, className) {
    const a = node('a', className);
    a.href = href;
    return a;
  }

  function categoryById(id) {
    const found = DOMVELI_CONFIG.categories.find(
      category => category.id === id
    );

    if (!found) {
      console.warn('[DOMVELI] Chýba kategória s id:', id);
    }

    return found || null;
  }

  function sectionHeading(kicker, title, description) {
    const wrapper = node('div', 'dv-section-heading');

    append(
      wrapper,
      node('div', 'dv-kicker', kicker),
      node('h2', 'dv-heading', title),
      node('p', 'dv-lead', description)
    );

    return wrapper;
  }

  /* ============================================================
     1. KATEGÓRIE
     ============================================================ */

  function renderCategories(root) {
    const config = DOMVELI_CONFIG.categorySection || {
      linkText: 'OBJAVIŤ KOLEKCIU →'
    };
    const section = node('section', 'dv-section dv-categories');
    section.id = 'kategorie';
    const grid = node('div', 'dv-category-grid');

    DOMVELI_CONFIG.categories.forEach(category => {
      const card = link(category.url, 'dv-category-card');
      const content = node('span', 'dv-category-content');

      append(
        content,
        node('strong', 'dv-category-title', category.name),
        node('span', 'dv-category-link', config.linkText)
      );

      append(
        card,
        image(category.image, category.name),
        content
      );

      grid.appendChild(card);
    });

    const intro = node('div', 'dv-sets-intro');
    const area = node('div', 'dv-sets-area');

    append(
      intro,
      node('div', 'dv-kicker', config.kicker),
      node('h2', 'dv-sets-heading', config.title),
      node('p', 'dv-sets-subtitle', config.description)
    );

    area.appendChild(grid);
    append(section, intro, area);

    root.appendChild(section);

    createCarousel(grid, {
      showArrows: true,
      previousLabel: 'Predchádzajúce kategórie',
      nextLabel: 'Ďalšie kategórie'
    });

    // Šípky presunieme pod text vpravo.
    const controls = section.querySelector('.dv-carousel-controls');

    if (controls) {
      intro.appendChild(controls);
    }
  }

  /* ============================================================
     4. POMOCNÁ FUNKCIA
     ============================================================ */

  function createElement(tag, className, text, href = '') {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    if (href !== '') element.href = href;

    return element;
  }

  /* ============================================================
     5. PROMO BANNERY
     ============================================================ */

  function renderPromoBanners() {
    const root = document.getElementById('domveli-home');

    if (!root || root.querySelector(':scope > .dv-promo-banners:not([data-dv-static])')) {
      return;
    }

    const banners = DOMVELI_CONFIG.banners.slice(0, 3);

    if (banners.length !== 3) return;

    // Statická verzia z HTML (hero banner a rezervované miesto) sa len oživí.
    const staticSection = root.querySelector(':scope > .dv-promo-banners[data-dv-static]');
    const section = staticSection || createElement(
      'section',
      'dv-promo-banners'
    );

    if (!staticSection) {
      section.setAttribute(
        'aria-label',
        'Vianočné kolekcie DOMVELI'
      );
    }

    function getValue(value, index) {
      if (Array.isArray(value)) {
        return value[index] ?? value[0] ?? '';
      }

      return value ?? '';
    }

    banners.forEach((banner, bannerIndex) => {
      const images = (
        Array.isArray(banner.images)
          ? banner.images
          : banner.image
            ? [banner.image]
            : []
      ).filter(Boolean);

      if (!images.length) return;

      const existing = staticSection
        ? staticSection.querySelector(`.dv-promo-card--${bannerIndex + 1}`)
        : null;
      const card = existing || createElement(
        'article',
        `dv-promo-card dv-promo-card--${bannerIndex + 1}`
      );

      // Použije prvok zo statického HTML, ak existuje, inak ho vytvorí.
      function part(parent, selector, tag, className) {
        let element = parent.querySelector(selector);

        if (!element) {
          element = createElement(tag, className);
          parent.appendChild(element);
        }

        return element;
      }

      const picture = part(card, '.dv-promo-image', 'img', 'dv-promo-image');

      if (!existing) {
        picture.loading = bannerIndex === 0 ? 'eager' : 'lazy';
        if (bannerIndex === 0) picture.fetchPriority = 'high';
      }

      part(card, '.dv-promo-overlay', 'div', 'dv-promo-overlay');
      const content = part(card, '.dv-promo-content', 'div', 'dv-promo-content');
      const uptitle = part(content, '.dv-promo-uptitle', 'span', 'dv-promo-uptitle');
      const title = part(content, '.dv-promo-title', 'h2', 'dv-promo-title');
      const description = part(content, '.dv-promo-description', 'p', 'dv-promo-description');
      const button = part(content, '.dv-promo-button', 'a', 'dv-promo-button');

      if (!existing) section.appendChild(card);

      const slides = images.map((image, index) => ({
        image,
        uptitle: getValue(banner.uptitle, index),
        title: getValue(banner.title, index),
        description: getValue(banner.description, index),
        button: getValue(banner.button, index),
        link: getValue(
          banner.links ?? banner.link,
          index
        )
      }));

      function renderSlide(slide) {
        picture.src = slide.image;
        picture.alt = slide.title;

        uptitle.textContent = slide.uptitle;
        title.textContent = slide.title;
        description.textContent = slide.description;

        button.textContent =
          slide.button || 'OBJAVIŤ KOLEKCIU →';

        button.href = slide.link || '#';
      }

      if (slides.length > 1) {
        card.classList.add('dv-fade-carousel');

        createFadeCarousel(card, {
          slides,
          renderSlide,
          autoplay: true,
          interval: 10000,
          showArrows: true,
          showDots: true
        });
      } else {
        renderSlide(slides[0]);
      }
    });

    if (staticSection) return;

    const categories = root.querySelector(
      '.dv-categories'
    );

    if (categories) {
      categories.insertAdjacentElement(
        'afterend',
        section
      );
    } else {
      root.appendChild(section);
    }
  }

  /* ============================================================
     6. VÝHODNÉ SETY
     ============================================================ */

  function renderSets() {
    const root = document.getElementById('domveli-home');
    const config = DOMVELI_CONFIG.sets;

    if (!root || !config || root.querySelector(':scope > .dv-sets:not([data-dv-static])')) {
      return;
    }

    const section = createElement(
      'section',
      'dv-sets dv-section'
    );

    const intro = createElement(
      'div',
      'dv-sets-intro'
    );

    const kicker = createElement(
      'span',
      'dv-kicker',
      'DOMVELI KOLEKCIA'
    );

    const heading = createElement(
      'h2',
      'dv-sets-heading',
      config.title
    );

    const subtitle = createElement(
      'p',
      'dv-sets-subtitle',
      config.subtitle
    );

    const allButton = createElement(
      'a',
      'dv-sets-all',
      'Všetky sety →'
    );

    allButton.href = config.url;

    intro.append(
      kicker,
      heading,
      subtitle,
      allButton
    );

    const productArea = createElement(
      'div',
      'dv-sets-area'
    );

    const viewport = createElement(
      'div',
      'dv-sets-track'
    );

    config.products.forEach(product => {
      const card = createElement(
        'article',
        'dv-set-card'
      );

      const productLink = createElement(
        'a',
        'dv-set-product'
      );

      productLink.href = product.url;

      const imageWrap = createElement(
        'div',
        'dv-set-image-wrap'
      );

      const picture = createElement(
        'img',
        'dv-set-image'
      );

      picture.src = product.image;
      picture.alt = product.name;
      picture.loading = 'lazy';

      imageWrap.appendChild(picture);

      if (product.discount) {
        const discount = createElement(
          'span',
          'dv-set-discount',
          product.discount
        );

        imageWrap.appendChild(discount);
      }

      const name = createElement(
        'h3',
        'dv-set-name',
        product.name
      );

      productLink.append(imageWrap, name);

      const footer = createElement(
        'div',
        'dv-set-footer'
      );

      const prices = createElement(
        'div',
        'dv-set-prices'
      );

      const price = createElement(
        'strong',
        'dv-set-price',
        product.price
      );

      prices.appendChild(price);

      if (product.oldPrice) {
        const oldPrice = createElement(
          'del',
          'dv-set-old-price',
          product.oldPrice
        );

        prices.appendChild(oldPrice);
      }

      const button = createElement(
        'a',
        'dv-set-button',
        'Pozrieť set →'
      );

      button.href = product.url;

      footer.append(prices, button);

      card.append(
        productLink,
        footer
      );

      viewport.appendChild(card);
    });

    productArea.appendChild(viewport);
    section.append(intro, productArea);

    const categories = root.querySelector(
      '.dv-categories'
    );

    if (categories) {
      categories.insertAdjacentElement(
        'afterend',
        section
      );
    } else {
      root.appendChild(section);
    }

    createCarousel(viewport, {
      showArrows: true,
      autoplay: false,
      loop: false,
      previousLabel: 'Predchádzajúce sety',
      nextLabel: 'Ďalšie sety'
    });
  }


  /* ============================================================
     6b. OBĽÚBENÉ PRODUKTY A VÝHODNÁ PONUKA
     Rovnaký vzhľad ako sety. Dáta z configu (favorites / deals),
     favorites má fallback na vybrané sety.
     ============================================================ */

  function renderProductRail(options) {
    const root = document.getElementById('domveli-home');
    const config = options.config;

    if (!root || !config || !Array.isArray(config.products) ||
        !config.products.length ||
        root.querySelector(':scope > .' + options.className + ':not([data-dv-static])')) {
      return;
    }

    const section = createElement(
      'section',
      'dv-sets dv-section ' + options.className
    );
    const intro = createElement('div', 'dv-sets-intro');
    const all = createElement('a', 'dv-sets-all', options.allText);

    all.href = config.url || '/';

    intro.append(
      createElement('span', 'dv-kicker', options.kicker),
      createElement('h2', 'dv-sets-heading', config.title),
      createElement('p', 'dv-sets-subtitle', config.subtitle || ''),
      all
    );

    const area = createElement('div', 'dv-sets-area');
    const track = createElement('div', 'dv-sets-track');

    config.products.forEach(product => {
      const card = createElement(
        'article',
        product.featured ? 'dv-set-card dv-set-card--featured' : 'dv-set-card'
      );
      const productLink = createElement('a', 'dv-set-product');
      const imageWrap = createElement('div', 'dv-set-image-wrap');
      const picture = createElement('img', 'dv-set-image');

      productLink.href = product.url;
      picture.src = product.image;
      picture.alt = product.name;
      picture.loading = 'lazy';
      imageWrap.appendChild(picture);

      if (product.discount) {
        imageWrap.appendChild(
          createElement('span', 'dv-set-discount', product.discount)
        );
      }

      if (product.badge) {
        imageWrap.appendChild(
          createElement('span', 'dv-set-badge', product.badge)
        );
      }

      productLink.append(
        imageWrap,
        createElement('h3', 'dv-set-name', product.name)
      );

      const prices = createElement('div', 'dv-set-prices');
      prices.appendChild(createElement('strong', 'dv-set-price', product.price));

      if (product.oldPrice) {
        prices.appendChild(
          createElement('del', 'dv-set-old-price', product.oldPrice)
        );
      }

      const button = createElement('a', 'dv-set-button', options.buttonText);
      button.href = product.url;

      const footer = createElement('div', 'dv-set-footer');
      footer.append(prices, button);
      card.append(productLink, footer);
      track.appendChild(card);
    });

    area.appendChild(track);
    section.append(intro, area);

    const anchor = (options.after || [])
      .map(selector => root.querySelector(selector))
      .find(Boolean);

    if (anchor) {
      anchor.insertAdjacentElement('afterend', section);
    } else {
      root.appendChild(section);
    }

    createCarousel(track, {
      showArrows: true,
      autoplay: false,
      loop: false,
      previousLabel: options.previousLabel,
      nextLabel: options.nextLabel
    });
  }

  // Zvýraznený produkt (config.featuredProduct) ide ako prvá karta obľúbených.
  function withFeatured(config) {
    const featured = DOMVELI_CONFIG.featuredProduct;

    if (!config || !featured) return config;

    const products = (config.products || []).filter(
      product => product.url !== featured.url
    );

    products.unshift({
      name: featured.title,
      image: featured.image,
      url: featured.url,
      price: featured.price,
      oldPrice: featured.oldPrice || '',
      discount: '',
      badge: featured.badge || 'TOP VÝBER',
      featured: true
    });

    return { ...config, products };
  }

  function renderFavorites() {
    const sets = DOMVELI_CONFIG.sets;
    const fallback = sets && Array.isArray(sets.products)
      ? { title: 'Obľúbené produkty', subtitle: 'Najčastejšie vyberané zákazníkmi.', url: sets.url, products: sets.products.slice(0, 6) }
      : null;

    renderProductRail({
      config: withFeatured(DOMVELI_CONFIG.favorites || fallback),
      className: 'dv-favorites',
      kicker: 'TOP VÝBER',
      allText: 'Všetky produkty →',
      buttonText: 'Pozrieť produkt →',
      after: ['.dv-sets'],
      previousLabel: 'Predchádzajúce produkty',
      nextLabel: 'Ďalšie produkty'
    });
  }

  function renderDeals() {
    renderProductRail({
      config: DOMVELI_CONFIG.deals,
      className: 'dv-deals',
      kicker: 'AKCIA',
      allText: 'Všetky akcie →',
      buttonText: 'Využiť ponuku →',
      after: ['.dv-favorites', '.dv-sets'],
      previousLabel: 'Predchádzajúce ponuky',
      nextLabel: 'Ďalšie ponuky'
    });
  }


  /* ============================================================
     7. AKO TO FUNGUJE
     ============================================================ */

  // Shoptet inline SVG z vloženého HTML odstráni, preto sa ikony krokov
  // doplnia až tu (text a nadpisy sú v HTML).
  const HOW_ICONS = [
    '<path d="M3 11h18l-2 10H5L3 11Z"/><path d="m8 11 4-8 4 8"/><path d="M9 15v3M15 15v3"/>',
    '<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l3 12h12l3-9H5"/>',
    '<path d="M1 5h13v12H1z"/><path d="M14 9h4l4 4v4h-8"/><circle cx="5" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    '<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/><path d="M19 2v4M17 4h4"/>'
  ];

  function fillHowIcons(root) {
    root.querySelectorAll('.dv-how .dv-how-icon').forEach((wrap, index) => {
      if (wrap.querySelector('svg') || !HOW_ICONS[index]) return;

      wrap.innerHTML =
        '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" ' +
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' + HOW_ICONS[index] + '</svg>';
    });
  }

  /* ============================================================
     8. DOMVELI MAGAZÍN – AUTOMATICKÉ ČLÁNKY Z SHOPTETU
     ============================================================ */

  function getShoptetHomepageArticles() {
    const nativeWrapper = document.querySelector(
      '.homepage-blog-wrapper'
    );

    if (!nativeWrapper) {
      return {
        nativeWrapper: null,
        articles: []
      };
    }

    const articles = [];
    const seen = new Set();

    nativeWrapper.querySelectorAll('.news-item').forEach(item => {

      const anchor = item.querySelector('a[href]');
      const titleElement = item.querySelector('.text .title');

      if (!anchor || !titleElement) return;

      let url;

      try {
        url = new URL(
          anchor.getAttribute('href'),
          window.location.href
        );
      } catch (_) {
        return;
      }

      if (
        url.origin !== window.location.origin ||
        seen.has(url.pathname)
      ) {
        return;
      }

      const title = titleElement.textContent
        .replace(/\s+/g, ' ')
        .trim();

      if (!title) return;

      const img = item.querySelector('.image img');

      const imagePath =
        img?.getAttribute('data-src') ||
        img?.getAttribute('src') ||
        '';

      let imageUrl = '';

      if (imagePath) {
        try {
          imageUrl = new URL(
            imagePath,
            window.location.href
          ).href;
        } catch (_) {
          // Neplatnú URL obrázka ignorujeme.
        }
      }

      const rawDescription =
        item.querySelector('.text .description')
          ?.textContent.replace(/\s+/g, ' ').trim() || '';

      const maxLength = 155;

      const description =
        rawDescription.length > maxLength
          ? rawDescription
              .slice(0, maxLength)
              .replace(/\s+\S*$/, '') + '…'
          : rawDescription;

      seen.add(url.pathname);

      articles.push({
        title,
        url: url.href,
        image: imageUrl,
        description
      });
    });

    return {
      nativeWrapper,
      articles
    };
  }

  function renderInspirationBlog(root) {
    const config = DOMVELI_CONFIG.inspirationBlog || {};

    if (
      !root ||
      root.querySelector(':scope > .dv-blog:not([data-dv-static])')
    ) {
      return;
    }

    const {
      nativeWrapper,
      articles: nativeArticles
    } = getShoptetHomepageArticles();

    if (!nativeArticles.length) {
      console.warn(
        '[DOMVELI] Shoptet články sa nenašli v ' +
        '.homepage-blog-wrapper .news-item.'
      );

      return;
    }

    const section = node(
      'section',
      'dv-section dv-blog'
    );

    const intro = node(
      'div',
      'dv-blog-intro'
    );

    append(
      intro,
      node('span', 'dv-kicker', config.kicker),
      node('h2', 'dv-blog-heading', config.title),
      node('p', 'dv-blog-description', config.description)
    );

    const allArticles = link(
      config.url || '/blog/',
      'dv-blog-all'
    );

    allArticles.textContent =
      config.button || 'Všetky inšpirácie →';

    intro.appendChild(allArticles);

    const articles = node(
      'div',
      'dv-blog-articles'
    );

    nativeArticles.forEach(article => {
      const card = node(
        'article',
        'dv-blog-card'
      );

      if (article.image) {
        const imageLink = link(
          article.url,
          'dv-blog-image-link'
        );

        imageLink.appendChild(
          image(
            article.image,
            article.title,
            'dv-blog-image'
          )
        );

        card.appendChild(imageLink);
      }

      const titleLink = link(
        article.url,
        'dv-blog-title-link'
      );

      titleLink.appendChild(
        node(
          'h3',
          'dv-blog-card-title',
          article.title
        )
      );

      card.appendChild(titleLink);

      if (article.description) {
        card.appendChild(
          node(
            'p',
            'dv-blog-excerpt',
            article.description
          )
        );
      }

      articles.appendChild(card);
    });

    
  append(
    section,
    intro,
    articles
  );

    const feature = root.querySelector('.dv-feature');

    if (feature) {
      feature.insertAdjacentElement('afterend', section);
    } else {
      root.appendChild(section);
    }

    // Až teraz inicializujeme existujúci DOMVELI carousel.
    // Komponent už dokáže zmerať skutočnú šírku.
    createCarousel(articles, {
      showArrows: true,
      autoplay: false,
      loop: false,
      previousLabel: 'Predchádzajúce články',
      nextLabel: 'Ďalšie články'
    });

    // Presun šípok do ľavého stĺpca magazínu,
// hneď za tlačidlo "Všetky inšpirácie".
    const carouselControls = section.querySelector(
      '.dv-carousel-controls'
    );

    if (carouselControls) {
      intro.appendChild(carouselControls);
      carouselControls.classList.add('dv-blog-controls');
    }

    // Pôvodný Shoptet blok skryjeme.
    if (nativeWrapper) {
      nativeWrapper.style.setProperty(
        'display',
        'none',
        'important'
      );

      nativeWrapper.setAttribute(
        'aria-hidden',
        'true'
      );
    }
  }

  /* ============================================================
     9. SPUSTENIE
     ============================================================ */


  /* ============================================================
     PORADIE SEKCIÍ NA STRÁNKE
     Zmeň len poradie v tomto zozname. Poradie volaní v init() nerozhoduje.
     ============================================================ */

  const SECTION_ORDER = [
    'dv-promo-banners',

    'dv-sets',
    'dv-favorites',
        'dv-categories',

    'dv-deals',

    'dv-how',
    'dv-feature',
    'dv-blog',
        'dv-seo',

    'dv-story'
  ];

  /* ============================================================
     STATICKÉ SEKCIE Z HTML
     Nadpisy, úvody, SEO text, O značke, postup nákupu a príbeh sú priamo
     v HTML v Shoptete (sekcie s atribútom data-dv-static). JS z hybridných
     sekcií doplní len dynamické časti (produkty, karusely) a duplicitné
     nadpisy zahodí.
     ============================================================ */

  const HYBRID = ['dv-favorites', 'dv-deals', 'dv-sets', 'dv-categories', 'dv-blog'];
  const INTRO = '.dv-sets-intro, .dv-blog-intro';

  function sectionKey(section) {
    return HYBRID.find(
      key => section.classList.contains(key)
    );
  }

  function reconcileStatic(root) {
    root.querySelectorAll(':scope > [data-dv-static]').forEach(staticSection => {
      const key = sectionKey(staticSection);

      if (!key) return;

      const built = Array.from(root.children).find(
        child => child !== staticSection &&
          !child.hasAttribute('data-dv-static') &&
          sectionKey(child) === key
      );

      if (!built) return;

      const staticIntro = staticSection.querySelector(':scope > ' + INTRO.split(', ').join(', :scope > '));
      const builtIntro = built.querySelector(':scope > ' + INTRO.split(', ').join(', :scope > '));

      Array.from(staticSection.children).forEach(child => {
        if (child !== staticIntro) child.remove();
      });

      Array.from(built.children).forEach(child => {
        if (child !== builtIntro) staticSection.appendChild(child);
      });

      // Šípky karuselu patria do úvodného stĺpca.
      const controls = builtIntro && builtIntro.querySelector('.dv-carousel-controls');

      if (controls && staticIntro) {
        if (key === 'dv-blog') controls.classList.add('dv-blog-controls');
        staticIntro.appendChild(controls);
      }

      built.remove();
    });
  }

  function applySectionOrder(root) {
    SECTION_ORDER.forEach(className => {
      const section = Array.from(root.children).find(
        child => child.classList.contains(className) &&
          !(className === 'dv-sets' && child.classList.contains('dv-favorites')) &&
          !(className === 'dv-sets' && child.classList.contains('dv-deals'))
      );

      if (section) {
        root.appendChild(section);
      }
    });
  }

  async function init() {
    const root = document.getElementById(
      'domveli-home'
    );

    if (!root) return;

    // Ikony sa dajú doplniť hneď, bez čakania na config.
    fillHowIcons(root);

    if (root.dataset.dvInitialized === 'true') {
      return;
    }

    try {
      ({ DOMVELI_CONFIG } = await loadConfig());
    } catch (error) {
      console.error('[DOMVELI] Titulná stránka: konfiguráciu sa nepodarilo načítať.', error);
      return;
    }

    root.dataset.dvInitialized = 'true';

    if (!document.querySelector('h1')) {
      root.prepend(
        node(
          'h1',
          'dv-visually-hidden',
          'Vianočné osvetlenie a dekorácie DOMVELI'
        )
      );
    }

    renderPromoBanners();
    renderSets();
    renderCategories(root);
    renderFavorites();
    renderDeals();
    renderInspirationBlog(root);
    reconcileStatic(root);
    applySectionOrder(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init
    );
  } else {
    init();
  }
})();
