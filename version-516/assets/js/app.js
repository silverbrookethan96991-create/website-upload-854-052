(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-nav-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20 || !document.querySelector('[data-hero-slider]')) {
      header.classList.add('is-scrolled');
    } else if (!header.classList.contains('menu-open')) {
      header.classList.remove('is-scrolled');
    }
  }

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
      updateHeader();
    });
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
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

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    showSlide(0);
    restartTimer();
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
  filterBars.forEach(function (bar) {
    var container = bar.parentElement;
    var input = bar.querySelector('[data-filter-input]');
    var year = bar.querySelector('[data-year-filter]');
    var count = bar.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-filter-card]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || cardYear === selectedYear;
        var shouldShow = matchKeyword && matchYear;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    applyFilter();
  });
})();
