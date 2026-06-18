(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(nextSlide, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterCount = document.querySelector('[data-filter-count]');

  if (filterInput && filterList) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q') || '';
    if (preset) {
      filterInput.value = preset;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(filterInput.value);
      var selected = normalize(filterSelect ? filterSelect.value : '');
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.textContent
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchSelected = !selected || haystack.indexOf(selected) !== -1;
        var isVisible = matchQuery && matchSelected;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = visible ? '已匹配 ' + visible + ' 部' : '暂无匹配影片';
      }
    }

    filterInput.addEventListener('input', applyFilter);
    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  var playerShells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  playerShells.forEach(function (shell) {
    var video = shell.querySelector('video[data-hls]');
    var playButton = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-play-status]');
    var hlsInstance = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function loadVideo() {
      if (!video || loaded) {
        return Promise.resolve();
      }

      var url = video.dataset.hls;
      loaded = true;
      setStatus('正在载入高清画面...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.add('is-ready');
          setStatus('');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('当前网络暂时无法播放');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        shell.classList.add('is-ready');
        setStatus('');
        return Promise.resolve();
      }

      video.src = url;
      shell.classList.add('is-ready');
      setStatus('');
      return Promise.resolve();
    }

    function playVideo() {
      loadVideo().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            shell.classList.add('is-playing');
            setStatus('');
          }).catch(function () {
            shell.classList.remove('is-playing');
          });
        } else {
          shell.classList.add('is-playing');
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
