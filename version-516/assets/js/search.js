(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var movies = window.SEARCH_MOVIES || [];

  if (!form || !input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

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
      '<article class="movie-card movie-card-compact">',
      '  <a href="movie/' + escapeHtml(movie.id) + '.html" class="movie-cover" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="cover-gradient"></span>',
      '    <span class="play-badge">▶</span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '    <h3><a href="movie/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-list compact">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function applySearch() {
    var query = input.value.trim().toLowerCase();
    var filtered = movies.filter(function (movie) {
      if (!query) {
        return true;
      }
      return movie.searchText.toLowerCase().indexOf(query) !== -1;
    });

    results.innerHTML = filtered.slice(0, 240).map(renderCard).join('');
    if (count) {
      var suffix = filtered.length > 240 ? '，已展示前 240 条' : '';
      count.textContent = '共找到 ' + filtered.length + ' 部影片' + suffix;
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    window.history.replaceState({}, '', url);
    applySearch();
  });

  input.addEventListener('input', applySearch);
  applySearch();
})();
