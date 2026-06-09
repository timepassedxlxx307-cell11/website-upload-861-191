(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    play();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var genre = panel.querySelector("[data-filter-genre]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "暂未找到匹配影片，请调整搜索条件。";

      function apply() {
        var keyword = normalize(input && input.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !y || normalize(card.getAttribute("data-year")) === y;
          var matchesGenre = !g || normalize(card.getAttribute("data-genre")).indexOf(g) !== -1;
          var visible = matchesKeyword && matchesYear && matchesGenre;
          card.classList.toggle("is-filtered-out", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (shown === 0 && !empty.parentNode) {
          grid.appendChild(empty);
        }
        if (shown > 0 && empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }

      [input, year, genre].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.link + '" data-title="' + escapeHtml(movie.title) + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="score">' + movie.score + '</span>',
      '    <span class="play-corner">▶</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.desc) + '</p>',
      '    <div class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var title = document.querySelector("[data-search-title]");
    var box = document.querySelector("[data-search-box]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (box) {
      box.value = query;
    }
    var keyword = normalize(query);
    if (!keyword) {
      return;
    }
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return normalize([movie.title, movie.genre, movie.tags, movie.year, movie.region, movie.type].join(" ")).indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "“" + query + "”的搜索结果";
    }
    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">暂未找到匹配影片，请尝试更换关键词。</div>';
      return;
    }
    results.innerHTML = matched.map(movieCard).join("");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
}());
