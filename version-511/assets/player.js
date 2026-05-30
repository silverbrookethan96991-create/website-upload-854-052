(function () {
  function setupPlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-player-toggle]'));
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      loadVideo();
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    function toggleVideo(event) {
      if (event) {
        event.preventDefault();
      }

      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    toggles.forEach(function (button) {
      button.addEventListener('click', toggleVideo);
    });

    video.addEventListener('click', function () {
      if (video.controls) {
        return;
      }
      toggleVideo();
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
    video.addEventListener('loadedmetadata', function () {
      video.controls = true;
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.startMoviePlayer = setupPlayer;
})();
