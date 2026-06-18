(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
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
            var index = 0;
            var timer = null;

            function show(nextIndex) {
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

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var filterInput = document.querySelector('[data-card-filter]');
        var cardContainer = document.querySelector('[data-card-container]');
        var emptyState = document.querySelector('[data-empty-state]');

        if (filterInput && cardContainer) {
            var cards = Array.prototype.slice.call(cardContainer.querySelectorAll('.movie-card'));
            filterInput.addEventListener('input', function () {
                var keyword = filterInput.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute('data-keywords') || card.textContent.toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            });
        }
    });
})();
