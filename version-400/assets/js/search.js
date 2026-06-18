(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '        <span class="poster-play">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-tags">' + tags + '</div>',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    ready(function () {
        var form = document.querySelector('[data-search-form]');
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var data = window.MOVIE_SEARCH_DATA || [];

        if (!form || !input || !results || !status) {
            return;
        }

        function runSearch(keyword) {
            var value = String(keyword || '').trim().toLowerCase();
            if (!value) {
                results.innerHTML = '';
                status.textContent = '请输入关键词开始搜索。';
                return;
            }

            var matched = data.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(value) !== -1;
            }).slice(0, 120);

            if (!matched.length) {
                results.innerHTML = '';
                status.textContent = '没有找到匹配影片，请更换关键词。';
                return;
            }

            status.textContent = '已为你显示相关影片，点击卡片可进入详情页。';
            results.innerHTML = matched.map(renderCard).join('\n');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set('q', input.value.trim());
            window.history.replaceState({}, '', url.toString());
            runSearch(input.value);
        });

        input.addEventListener('input', function () {
            runSearch(input.value);
        });

        var initial = new URL(window.location.href).searchParams.get('q') || '';
        if (initial) {
            input.value = initial;
            runSearch(initial);
        }
    });
})();
