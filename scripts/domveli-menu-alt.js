// Obrázky kategórií v menu nemajú alt text, Shoptet pre ne nemá pole.
// Alt sa doplní z textu odkazu na tú istú kategóriu.
(function () {
  function fix() {
    document.querySelectorAll('.menu-image img').forEach(function (img) {
      if (img.alt) return;
      var link = img.closest('a');
      var href = link && link.getAttribute('href');
      if (!href) return;
      var label = Array.prototype.map.call(
        document.querySelectorAll('a[href="' + href.replace(/"/g, '\\"') + '"]'),
        function (a) { return a.textContent.trim(); }
      ).find(Boolean);
      if (label) img.alt = label;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
})();
