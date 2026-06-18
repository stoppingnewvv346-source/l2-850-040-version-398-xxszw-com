(function () {
  var video = document.querySelector('.movie-player');
  var button = document.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var hls = null;

  function bind() {
    if (!stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      video.src = stream;
    }
  }

  function play() {
    if (!video.src && (!hls || !hls.media)) {
      bind();
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });

  bind();

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
