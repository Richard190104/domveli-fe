// Jediný súbor, ktorý Shoptet načítava. Verzia sa doplní pri builde.
(function () {
  var BASE = 'https://richard190104.github.io/domveli-fe/';
  var V = '__VERSION__';
  var b = document.body.classList;

  var FILES = [
    { css: 'css/blog.css' },
    { css: 'css/domveli-cart-popup.css' },
    { css: 'css/domveli-checkout.css' },
    { css: 'css/domveli-footer.css' },
    { css: 'css/domveli-listing.css' },
    { css: 'css/domveli-navbar.css' },
    { css: 'css/domveli-notifications.css' },
    { css: 'css/domveli-product.css' },
    { css: 'css/domveli.css' },
    { css: 'css/profile.css' },
    { js: 'scripts/domveli-config-loader.js' },
    { js: 'scripts/domveli-config.js' },
    { js: 'scripts/domveli-notifications-config.js' },
    { js: 'scripts/domveli-carousel.js' },
    { js: 'scripts/domveli-footer.js' },
    { js: 'scripts/domveli-notifications.js' },
    { js: 'scripts/domveli-cart-popup.js' },
    { js: 'scripts/domveli-menu-alt.js' },
    { js: 'scripts/domveli-share.js', when: 'in-blog' },
    { js: 'scripts/domveli.js', when: 'in-index' },
    { js: 'scripts/domveli-listing.js', when: 'type-category' },
    { js: 'scripts/domveli-product-benefits.js', when: 'type-product' },
    { js: 'scripts/domveli-blog.js', when: 'in-blog' }
  ];

  FILES.forEach(function (f) {
    if (f.when && !b.contains(f.when)) return;
    if (f.css) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = BASE + f.css + '?v=' + V;
      document.head.appendChild(l);
    }
    if (f.js) {
      var s = document.createElement('script');
      s.type = 'module';
      s.src = BASE + f.js + '?v=' + V;
      document.head.appendChild(s);
    }
  });
})();
