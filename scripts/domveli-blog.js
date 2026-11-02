
(function () {
    'use strict';

    function initDomveliBlog() {
        const wrapper = document.querySelector(
            'body.in-blog #newsWrapper'
        );

        if (!wrapper) {
            return;
        }

        const articles = wrapper.querySelectorAll('.news-item');

        articles.forEach((article) => {
            const heading = article.querySelector('h2');
            const articleLink = heading?.querySelector('a[href]');

            if (!heading || !articleLink) {
                return;
            }

            const articleUrl = articleLink.href;

            // Skontrolujeme, či má článok vlastný obrázok.
            const hasImage = Array.from(
                article.querySelectorAll('img')
            ).some((img) => !img.closest('.dv-blog-placeholder'));

            // Ak obrázok chýba, vytvoríme placeholder.
            if (
                !hasImage &&
                !article.querySelector('.dv-blog-placeholder')
            ) {
                const placeholder = document.createElement('a');

                placeholder.className = 'dv-blog-placeholder';
                placeholder.href = articleUrl;
                placeholder.setAttribute(
                    'aria-label',
                    heading.textContent.trim()
                );

                const icon = document.createElement('span');
                icon.className = 'dv-blog-placeholder-icon';
                icon.textContent = '✦';

                const text = document.createElement('span');
                text.className = 'dv-blog-placeholder-text';
                text.textContent = 'DOMVELI';

                placeholder.appendChild(icon);
                placeholder.appendChild(text);

                // Vložíme placeholder pred nadpis.
                heading.before(placeholder);
            }

            // Pridáme alebo aktualizujeme tlačidlo.
            let button = article.querySelector('.dv-blog-readmore');

            if (!button) {
                button = document.createElement('a');
                button.className = 'dv-blog-readmore';
                article.appendChild(button);
            }

            button.href = articleUrl;
            button.textContent = 'Zobraziť článok →';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initDomveliBlog
        );
    } else {
        initDomveliBlog();
    }
})();
