(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    root.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });

    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var input = document.querySelector("[data-card-search]");
    var grid = document.querySelector("[data-card-grid]");
    var empty = document.querySelector("[data-empty-state]");
    var clearButton = document.querySelector("[data-clear-search]");
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.children);

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    input.addEventListener("input", apply);
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        setTimeout(apply, 0);
      });
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initPlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  if (!video || !button || !options.source) {
    return;
  }
  var mounted = false;
  var hls = null;

  function mount() {
    if (mounted) {
      return;
    }
    mounted = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(options.source);
      hls.attachMedia(video);
      return;
    }
    video.src = options.source;
  }

  function start() {
    mount();
    button.classList.add("is-hidden");
    button.setAttribute("aria-hidden", "true");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
        button.removeAttribute("aria-hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!mounted || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
