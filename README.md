# Nasadenie domveli-fe

1. Skopíruj do repa `domveli-fe` (koreň): `.github/`, `loader.src.js`. Priečinky `scripts/` a `css/` tam už sú.
2. GitHub, repo, Settings, Pages, Source: GitHub Actions.
3. Push do `main`. Action skontroluje syntax, nastaví verziu a nasadí na https://richard190104.github.io/domveli-fe/.
4. Do Shoptetu (Vlastný kód v hlavičke) vlož raz a nahraď ním doterajšie vkladanie súborov:

   <script src="https://richard190104.github.io/domveli-fe/loader.js" defer></script>

5. Ďalšie zmeny: len push. Rollback: revert commitu.

Pred prvým nasadením porovnaj zoznam FILES v `loader.src.js` s tým, čo sa dnes načítava v Shoptete (podmienky `when` sú odhad podľa tried na body).
