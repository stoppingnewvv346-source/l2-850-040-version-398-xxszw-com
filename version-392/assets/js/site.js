(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('[data-mobile-toggle]');

    if (toggle && header) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('.poster-frame img, .hero-art img, .side-cover img, .rank-thumb img').forEach(function (img) {
        img.addEventListener('error', function () {
            var frame = img.closest('.poster-frame, .hero-art, .side-cover, .rank-thumb');
            if (frame) {
                frame.classList.add('is-missing');
            }
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === currentSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === currentSlide);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var keywordInput = document.querySelector('[data-filter-keyword]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var count = document.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-state]');
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = '当前显示 ' + visible + ' 部影片';
        }
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    document.querySelectorAll('[data-filter-keyword], [data-filter-region], [data-filter-type]').forEach(function (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
    });
    filterCards();

    function initHlsVideo(video, src) {
        if (!video || !src) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = src;
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var playLayer = player.querySelector('[data-play-layer]');
        var src = player.getAttribute('data-src') || (video && video.getAttribute('data-src'));
        var hasStarted = false;

        function startPlayback() {
            if (!video) {
                return;
            }
            if (!hasStarted) {
                initHlsVideo(video, src);
                hasStarted = true;
            }
            if (playLayer) {
                playLayer.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playLayer) {
            playLayer.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!hasStarted) {
                    startPlayback();
                }
            });
        }
    });

    function createSearchCard(item) {
        var posterPath = './' + item.poster;
        return '' +
            '<article class="movie-card" data-movie-card data-search="' + escapeHtml(item.search) + '" data-region="' + escapeHtml(item.region) + '" data-type="' + escapeHtml(item.type) + '">' +
                '<a class="poster-frame" href="movie/' + item.file + '">' +
                    '<img src="' + posterPath + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">' +
                    '<span class="poster-fallback">' + escapeHtml(item.title) + '</span>' +
                    '<span class="card-badge">' + escapeHtml(item.year) + '</span>' +
                    '<span class="card-score">★ ' + escapeHtml(item.rating) + '</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<h3 class="card-title"><a href="movie/' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="card-summary">' + escapeHtml(item.one_line) + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>·</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var globalSearchMount = document.querySelector('[data-global-search-results]');
    var globalSearchInput = document.querySelector('[data-global-search-input]');

    function renderGlobalSearch() {
        if (!globalSearchMount || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = normalize((globalSearchInput && globalSearchInput.value) || params.get('q'));
        if (globalSearchInput && !globalSearchInput.value && params.get('q')) {
            globalSearchInput.value = params.get('q');
        }
        var list = window.MOVIE_SEARCH_DATA.filter(function (item) {
            return !keyword || normalize(item.search).indexOf(keyword) !== -1;
        }).slice(0, 240);
        globalSearchMount.innerHTML = list.map(createSearchCard).join('');
        var count = document.querySelector('[data-global-search-count]');
        if (count) {
            count.textContent = keyword ? '为你找到 ' + list.length + ' 条相关结果（最多展示 240 条）' : '请输入关键词，或浏览下方默认推荐结果';
        }
    }

    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', renderGlobalSearch);
    }
    renderGlobalSearch();
})();
