(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
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

  var filterInput = document.querySelector('.js-filter-input');
  var filterType = document.querySelector('.js-filter-type');
  var filterCategory = document.querySelector('.js-filter-category');
  var filterGrid = document.querySelector('.filter-grid');

  if (filterInput && filterGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }

    function applyFilter() {
      var text = filterInput.value.trim().toLowerCase();
      var typeValue = filterType ? filterType.value : '';
      var categoryValue = filterCategory ? filterCategory.value : '';
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card, .rank-row'));

      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var matchCategory = !categoryValue || cardCategory === categoryValue;
        card.classList.toggle('is-hidden', !(matchText && matchType && matchCategory));
      });
    }

    filterInput.addEventListener('input', applyFilter);
    if (filterType) {
      filterType.addEventListener('change', applyFilter);
    }
    if (filterCategory) {
      filterCategory.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
})();
