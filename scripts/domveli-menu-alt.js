// Obrázky kategórií (menu + výpis podkategórií) nemajú alt text, Shoptet pre ne nemá pole.
// Alt sa doplní z textu odkazu na tú istú kategóriu.
(function () {
  function labelFor(a, href) {
    var own = a.textContent.trim();
    if (own) return own;
    return Array.prototype.map.call(
      document.querySelectorAll('a[href="' + href.replace(/"/g, '\\"') + '"]'),
      function (x) { return x.textContent.trim(); }
    ).find(Boolean);
  }

  function fix() {
    // menu + výpis podkategórií v kategórii (thumbnaily v span.image)
    document.querySelectorAll('.menu-image img, a > .image img').forEach(function (img) {
      if (img.alt && img.alt.trim()) return;
      var link = img.closest('a');
      var href = link && link.getAttribute('href');
      if (!href) return;
      var label = labelFor(link, href);
      if (label) img.alt = label;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
})();
