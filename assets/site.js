(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var sortSelect = document.querySelector('[data-sort-select]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    function filterCards() {
      var keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        card.style.display = card.textContent.toLowerCase().indexOf(keyword) >= 0 ? '' : 'none';
      });
    }

    filterInput.addEventListener('input', filterCards);
  }

  if (sortSelect && filterList) {
    sortSelect.addEventListener('change', function () {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      var mode = sortSelect.value;
      cards.sort(function (a, b) {
        if (mode === 'score') {
          return (parseFloat(b.textContent.match(/★\s*([0-9.]+)/)?.[1] || '0')) - (parseFloat(a.textContent.match(/★\s*([0-9.]+)/)?.[1] || '0'));
        }
        if (mode === 'year') {
          return (parseInt(b.textContent.match(/\b(19|20)\d{2}\b/)?.[0] || '0', 10)) - (parseInt(a.textContent.match(/\b(19|20)\d{2}\b/)?.[0] || '0', 10));
        }
        return 0;
      });
      cards.forEach(function (card) {
        filterList.appendChild(card);
      });
    });
  }
})();
