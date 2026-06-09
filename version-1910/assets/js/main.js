(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var previous = hero.querySelector('.hero-control.prev');
    var next = hero.querySelector('.hero-control.next');
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    var resetTimer = function () {
      window.clearInterval(timer);
      startTimer();
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        resetTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        resetTimer();
      });
    }

    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-search-input]');
    var clearSearch = filterPanel.querySelector('[data-clear-search]');
    var buttons = Array.prototype.slice.call(filterPanel.querySelectorAll('.filter-button'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list] .movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeKind = 'all';
    var activeValue = 'all';

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilters = function () {
      var query = normalize(searchInput ? searchInput.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var region = normalize(card.getAttribute('data-region'));
        var type = normalize(card.getAttribute('data-type'));
        var genre = normalize(card.getAttribute('data-genre'));
        var year = normalize(card.getAttribute('data-year'));
        var haystack = [title, region, type, genre, year].join(' ');
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = true;

        if (activeKind === 'genre') {
          matchesFilter = genre === normalize(activeValue);
        }

        if (activeKind === 'region') {
          matchesFilter = region === normalize(activeValue);
        }

        if (activeKind === 'type') {
          matchesFilter = type === normalize(activeValue);
        }

        var visible = matchesQuery && matchesFilter;
        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeKind = button.getAttribute('data-filter-kind') || 'all';
        activeValue = button.getAttribute('data-filter-value') || 'all';

        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        if (activeKind === 'all') {
          activeValue = 'all';
        }

        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        activeKind = 'all';
        activeValue = 'all';
        buttons.forEach(function (item, index) {
          item.classList.toggle('is-active', index === 0);
        });
        applyFilters();
      });
    }

    applyFilters();
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-video-url');
    var hlsInstance = null;
    var ready = false;

    if (!video || !cover || !url) {
      return;
    }

    var playVideo = function () {
      player.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };

    var prepareVideo = function () {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = url;
          }
        });
        return;
      }

      video.src = url;
      playVideo();
    };

    cover.addEventListener('click', prepareVideo);
    video.addEventListener('click', function () {
      if (!ready) {
        prepareVideo();
      }
    });
  });
})();
