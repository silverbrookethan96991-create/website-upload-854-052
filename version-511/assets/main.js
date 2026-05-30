(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function move(step) {
      showSlide(index + step);
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var textInput = filterPanel.querySelector('[data-page-filter]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilter() {
      var q = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || ''
        ].join(' ');
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!q || haystack.indexOf(q) !== -1) && (!year || cardYear === year);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (textInput) {
      textInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');

    if (input) {
      input.value = query;
    }

    function movieCard(movie) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="./movies/' + movie.file + '">',
        '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-play">▶</span>',
        '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<a class="movie-title" href="./movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    if (query) {
      var q = query.toLowerCase();
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      });
      searchResults.innerHTML = matches.slice(0, 200).map(movieCard).join('');
      if (status) {
        status.textContent = matches.length ? '找到 ' + matches.length + ' 个相关影片' : '没有匹配的影片';
      }
    }
  }
})();
