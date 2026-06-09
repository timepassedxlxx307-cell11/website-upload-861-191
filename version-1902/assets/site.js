(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupRails() {
        document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
            var rail = wrap.querySelector('[data-rail]');
            var left = wrap.querySelector('[data-rail-left]');
            var right = wrap.querySelector('[data-rail-right]');
            if (!rail) {
                return;
            }
            var amount = 420;
            if (left) {
                left.addEventListener('click', function () {
                    rail.scrollBy({ left: -amount, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    rail.scrollBy({ left: amount, behavior: 'smooth' });
                });
            }
        });
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var type = scope.querySelector('[data-filter-type]');
            var year = scope.querySelector('[data-filter-year]');
            var list = document.querySelector('[data-filter-list]');
            var empty = document.querySelector('[data-empty-state]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-genre') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = !typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1;
                    var matchesYear = !yearValue || (card.getAttribute('data-year') || '').indexOf(yearValue) !== -1;
                    var ok = matchesQuery && matchesType && matchesYear;
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (type) {
                type.addEventListener('change', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var start = wrap.querySelector('[data-player-start]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-source');
            var attached = false;

            function attachSource() {
                if (attached || !source) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                attachSource();
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (start) {
                start.addEventListener('click', playVideo);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                if (start) {
                    start.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (start && video.currentTime === 0) {
                    start.classList.remove('is-hidden');
                }
            });
            attachSource();
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupRails();
        setupFilters();
        setupSearchForms();
        setupPlayers();
    });
})();
