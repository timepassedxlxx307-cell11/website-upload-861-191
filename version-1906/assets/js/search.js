(function () {
  var movies = window.MOVIE_SEARCH_DATA || [];
  var root = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var keywordInput = document.querySelector('[data-filter-keyword]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var overflow = document.querySelector('[data-search-overflow]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function uniqueSorted(field) {
    var set = new Set();
    movies.forEach(function (movie) {
      if (Array.isArray(movie[field])) {
        movie[field].forEach(function (item) {
          if (item) {
            set.add(item);
          }
        });
      } else if (movie[field]) {
        set.add(movie[field]);
      }
    });
    return Array.from(set).sort(function (a, b) {
      return String(a).localeCompare(String(b), 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values, label) {
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">' + label + '</option>';
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function movieMatches(movie, keyword, region, type, genre) {
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags.join(' '),
      movie.oneLine,
      movie.summary
    ].join(' ').toLowerCase();

    if (keyword && haystack.indexOf(keyword.toLowerCase()) === -1) {
      return false;
    }

    if (region && movie.regionGroup !== region) {
      return false;
    }

    if (type && movie.typeGroup !== type) {
      return false;
    }

    if (genre && movie.genres.indexOf(genre) === -1) {
      return false;
    }

    return true;
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <div class="card-poster">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-type">' + escapeHtml(movie.typeGroup) + '</span>',
      '    <span class="card-rating">' + movie.rating + '</span>',
      '    <span class="card-play">▶</span>',
      '  </div>',
      '  <div class="card-body">',
      '    <strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>·</span>',
      '      <span>' + escapeHtml(movie.regionGroup) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render() {
    if (!root) {
      return;
    }

    var keyword = keywordInput ? keywordInput.value.trim() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var genre = genreSelect ? genreSelect.value : '';
    var results = movies.filter(function (movie) {
      return movieMatches(movie, keyword, region, type, genre);
    });

    if (status) {
      status.textContent = '共找到 ' + results.length + ' 部影片' + (keyword ? '，关键词：' + keyword : '');
    }

    root.innerHTML = results.slice(0, 120).map(card).join('\n');

    if (overflow) {
      overflow.textContent = results.length > 120
        ? '已展示前 120 条结果，可继续输入更精确的片名、地区、类型或题材。'
        : '';
    }

    if (!results.length) {
      root.innerHTML = '<div class="content-card"><h2>没有找到匹配影片</h2><p>可以换一个关键词，或清空筛选条件后再试。</p></div>';
    }
  }

  fillSelect(regionSelect, uniqueSorted('regionGroup'), '全部地区');
  fillSelect(typeSelect, uniqueSorted('typeGroup'), '全部类型');
  fillSelect(genreSelect, uniqueSorted('genres'), '全部题材');

  if (keywordInput) {
    keywordInput.value = initialQuery;
  }

  [keywordInput, regionSelect, typeSelect, genreSelect].forEach(function (control) {
    if (!control) {
      return;
    }

    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });

  render();
})();
