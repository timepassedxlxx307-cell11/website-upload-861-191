(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        var filterInput = filterForm.querySelector('[data-filter-input]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var resetButton = filterForm.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function applyFilters() {
            var keyword = (filterInput && filterInput.value || '').trim().toLowerCase();
            var type = typeSelect && typeSelect.value || '';
            var year = yearSelect && yearSelect.value || '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedType = !type || card.getAttribute('data-type') === type;
                var matchedYear = !year || card.getAttribute('data-year') === year;

                card.classList.toggle('hidden-card', !(matchedKeyword && matchedType && matchedYear));
            });
        }

        filterForm.addEventListener('input', applyFilters);
        filterForm.addEventListener('change', applyFilters);

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                filterForm.reset();
                applyFilters();
            });
        }
    }

    var searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot && window.MOVIES) {
        var input = searchRoot.querySelector('[data-search-input]');
        var results = searchRoot.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function render(query) {
            var value = (query || '').trim().toLowerCase();
            var list = window.MOVIES.filter(function (movie) {
                if (!value) {
                    return true;
                }

                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.description]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(value) !== -1;
            }).slice(0, 80);

            results.innerHTML = list.map(function (movie) {
                return '<a class="result-card" href="movies/' + movie.file + '">' +
                    '<img src="./' + movie.image + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span>' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year + ' · ' + movie.genre) + '</p>' +
                    '</span>' +
                    '<span class="btn">观看</span>' +
                    '</a>';
            }).join('');
        }

        function escapeHtml(text) {
            return String(text || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }

        render(initialQuery);
    }
}());
