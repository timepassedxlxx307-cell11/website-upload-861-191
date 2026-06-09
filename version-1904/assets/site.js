(() => {
  const header = document.querySelector('[data-site-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (header) {
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    showSlide(0);
    start();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterSelect = document.querySelector('[data-filter-select]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  const getQueryParam = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };

  const filterCards = () => {
    if (!cards.length) {
      return;
    }
    const text = (filterInput?.value || '').trim().toLowerCase();
    const selected = filterSelect?.value || '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const keywords = `${card.dataset.title || ''} ${card.dataset.keywords || ''}`.toLowerCase();
      const category = card.dataset.category || '';
      const matchedText = !text || keywords.includes(text);
      const matchedCategory = !selected || category === selected;
      const visible = matchedText && matchedCategory;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  };

  if (filterInput) {
    const initialQuery = getQueryParam();
    if (initialQuery && !filterInput.value) {
      filterInput.value = initialQuery;
    }
    filterInput.addEventListener('input', filterCards);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterCards);
  }

  filterCards();
})();
