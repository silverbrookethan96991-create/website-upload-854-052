(function () {
  var header = document.querySelector('[data-header]');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-cover]').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-missing');
    });
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderResults(container, query) {
    var data = window.MovieSearchData || [];
    var q = normalize(query);
    if (!container) {
      return;
    }
    if (!q) {
      container.classList.remove('is-open');
      container.innerHTML = '';
      return;
    }
    var matches = data.filter(function (item) {
      var text = [item.title, item.year, item.region, item.type, item.genre].join(' ');
      return normalize(text).indexOf(q) !== -1;
    }).slice(0, 12);
    if (!matches.length) {
      container.innerHTML = '<span class="search-result-item"><span></span><span><strong>未找到匹配影片</strong><span>可尝试地区、年份或类型关键词</span></span></span>';
      container.classList.add('is-open');
      return;
    }
    container.innerHTML = matches.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img data-cover src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');
    container.classList.add('is-open');
    container.querySelectorAll('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });
  }

  function initGlobalSearch() {
    document.querySelectorAll('.site-search').forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      var results = form.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }
      input.addEventListener('input', function () {
        renderResults(results, input.value);
      });
      input.addEventListener('focus', function () {
        renderResults(results, input.value);
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderResults(results, input.value);
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function initLocalFilters() {
    var input = document.querySelector('[data-page-filter-input]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-local-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeValue = 'all';

    if (!cards.length) {
      return;
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesQuery = !q || text.indexOf(q) !== -1;
        var matchesChip = activeValue === 'all' || text.indexOf(normalize(activeValue)) !== -1;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesChip));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeValue = chip.getAttribute('data-local-value') || 'all';
        chips.forEach(function (button) {
          button.classList.toggle('is-active', button === chip);
        });
        apply();
      });
    });
  }

  function attachHls(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
    video.dataset.ready = '1';
  }

  function initPlayers() {
    document.querySelectorAll('video[data-src]').forEach(function (video) {
      var wrap = video.closest('[data-player-wrap]');
      var overlay = wrap ? wrap.querySelector('[data-play-target]') : null;

      function play() {
        attachHls(video);
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (wrap) {
          wrap.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (wrap && video.currentTime === 0) {
          wrap.classList.remove('is-playing');
        }
      });
    });
  }

  initHero();
  initGlobalSearch();
  initLocalFilters();
  initPlayers();
})();
