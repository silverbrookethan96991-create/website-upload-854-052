(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var next = qs('[data-hero-next]', hero);
        var prev = qs('[data-hero-prev]', hero);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function (panel) {
            var search = qs('[data-card-search]', panel);
            var year = qs('[data-year-filter]', panel);
            var genre = qs('[data-genre-filter]', panel);
            var gridSelector = panel.getAttribute('data-target');
            var grid = gridSelector ? qs(gridSelector) : panel.nextElementSibling;
            if (!grid) {
                return;
            }
            var cards = qsa('[data-movie-card]', grid);
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';
            if (search && initial) {
                search.value = initial;
            }

            function normalize(value) {
                return (value || '').toString().trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(search ? search.value : '');
                var yearValue = normalize(year ? year.value : '');
                var genreValue = normalize(genre ? genre.value : '');
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = !yearValue || normalize(card.getAttribute('data-year')).indexOf(yearValue) !== -1;
                    var matchesGenre = !genreValue || normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).indexOf(genreValue) !== -1;
                    card.classList.toggle('hidden-card', !(matchesKeyword && matchesYear && matchesGenre));
                });
            }

            if (search) {
                search.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            if (genre) {
                genre.addEventListener('change', apply);
            }
            apply();
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = qs('[data-player-video]');
        var overlay = qs('[data-player-overlay]');
        var button = qs('[data-player-button]');
        var attached = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ capLevelToPlayerSize: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                attached = true;
                return;
            }
            video.src = sourceUrl;
            attached = true;
        }

        function playVideo() {
            attachSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
