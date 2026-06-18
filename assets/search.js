(function () {
  var data = window.MOVIE_SEARCH_DATA || [];
  var params = new URLSearchParams(window.location.search);
  var keyword = (params.get('q') || '').trim();
  var box = document.querySelector('[data-search-box]');
  var status = document.querySelector('[data-search-status]');
  var results = document.querySelector('[data-search-results]');

  if (box) {
    box.value = keyword;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function card(movie) {
    return '<a class="movie-card" href="' + movie.href + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="score-badge">★ ' + movie.score + '</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<span class="pill">' + escapeHtml(movie.category) + '</span>' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="meta-row"><span>' + escapeHtml(movie.duration) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  if (!results || !status) {
    return;
  }

  if (!keyword) {
    results.innerHTML = '';
    status.textContent = '输入关键词开始搜索';
    return;
  }

  var lower = keyword.toLowerCase();
  var found = data.filter(function (movie) {
    return [movie.title, movie.oneLine, movie.summary, movie.region, movie.year, movie.genre, movie.category, movie.tags.join(' ')]
      .join(' ')
      .toLowerCase()
      .indexOf(lower) >= 0;
  }).slice(0, 120);

  status.textContent = found.length ? '搜索结果：' + keyword : '未找到相关内容：' + keyword;
  results.innerHTML = found.map(card).join('');
})();
