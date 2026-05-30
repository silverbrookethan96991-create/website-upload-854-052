(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function restartHero() {
        if (!slides.length) {
            return;
        }
        clearInterval(heroTimer);
        heroTimer = setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    if (slides.length) {
        showSlide(0);
        restartHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restartHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restartHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restartHero();
            });
        });
    }

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
        var searchInput = panel.querySelector('[data-search-input]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var genreSelect = panel.querySelector('[data-filter-genre]');
        var empty = document.querySelector('[data-empty-state]');

        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : '';
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre
            ].join(' ').toLowerCase();
        }

        function filterCards() {
            var keyword = valueOf(searchInput);
            var region = valueOf(regionSelect);
            var type = valueOf(typeSelect);
            var year = valueOf(yearSelect);
            var genre = valueOf(genreSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && String(card.dataset.region || '').toLowerCase() !== region) {
                    matched = false;
                }
                if (type && String(card.dataset.type || '').toLowerCase() !== type) {
                    matched = false;
                }
                if (year && String(card.dataset.year || '').toLowerCase() !== year) {
                    matched = false;
                }
                if (genre && String(card.dataset.genre || '').toLowerCase().indexOf(genre) === -1) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (input) {
            if (input) {
                input.addEventListener('input', filterCards);
                input.addEventListener('change', filterCards);
            }
        });
    }
})();
