(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFiltering() {
    var inputs = selectAll('[data-filter-input]');
    if (!inputs.length) {
      return;
    }
    var cards = selectAll('.movie-card');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    function apply(value) {
      var q = normalize(value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta') + ' ' + card.textContent);
        card.classList.toggle('is-filtered-out', q && text.indexOf(q) === -1);
      });
      inputs.forEach(function (input) {
        if (input.value !== value) {
          input.value = value;
        }
      });
    }
    inputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', function () {
        apply(input.value);
      });
    });
    selectAll('.search-term').forEach(function (button) {
      button.addEventListener('click', function () {
        apply(button.textContent);
        var target = document.getElementById('search-input');
        if (target) {
          target.focus();
        }
      });
    });
    apply(query);
  }

  function startPlayer(url) {
    var video = document.getElementById('movie-video');
    var start = document.querySelector('.player-start');
    if (!video || !url) {
      return;
    }
    var prepared = false;
    var hls = null;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function play() {
      prepare();
      if (start) {
        start.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }
    if (start) {
      start.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      if (start) {
        start.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (start && video.currentTime === 0) {
        start.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    startPlayer: startPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFiltering();
  });
})();
