(function () {
    function whenReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                } else {
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var activeIndex = 0;
        var timer = null;
        function show(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = document.querySelectorAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.getAttribute('data-filter-panel') || document;
            var root = scope === 'document' ? document : document.querySelector(scope);
            if (!root) {
                root = document;
            }
            var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
            var textInput = panel.querySelector('[data-filter-text]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var empty = document.querySelector('[data-empty-result]');
            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }
            function applyFilters() {
                var keyword = normalize(textInput && textInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && textInput) {
                textInput.value = query;
            }
            applyFilters();
        });
    }

    function setupPlayers() {
        var shells = document.querySelectorAll('[data-player]');
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var cover = shell.querySelector('.player-cover');
            var button = shell.querySelector('.player-button');
            var playerUrl = shell.getAttribute('data-video-url');
            var started = false;
            var hls = null;
            function start() {
                if (!video || !playerUrl) {
                    return;
                }
                if (!started) {
                    started = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = playerUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(playerUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = playerUrl;
                    }
                    video.setAttribute('controls', 'controls');
                }
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener('click', start);
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    start();
                });
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        start();
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    whenReady(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupFilters();
        setupPlayers();
    });
})();
