(function () {
  var header = document.querySelector('[data-site-header]');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function onScroll() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';

      if (!keyword) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      window.location.href = form.getAttribute('data-search-base') + '?q=' + encodeURIComponent(keyword);
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAuto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startAuto();
      });
    }

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    showSlide(0);
    startAuto();
  }
})();
