(function () {
  var video = document.querySelector('[data-hls-player]');
  var overlay = document.querySelector('[data-play-overlay]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;
  var initialized = false;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay && video.paused) {
      overlay.classList.remove('is-hidden');
    }
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showOverlay();
      });
    }
  }

  function initializePlayer() {
    if (!source) {
      return;
    }

    if (initialized) {
      playVideo();
      return;
    }

    initialized = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        hideOverlay();
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        hideOverlay();
        playVideo();
      }, { once: true });
    } else {
      video.src = source;
      hideOverlay();
      playVideo();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', initializePlayer);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      initializePlayer();
    }
  });
  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', showOverlay);
})();
