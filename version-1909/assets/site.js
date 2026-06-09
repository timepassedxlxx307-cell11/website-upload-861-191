(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMobileNav();
        initHero();
        initSearch();
        initPlayer();
        initScrollPlay();
        initQuerySearch();
    });

    function initMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        inputs.forEach(function (input) {
            var container = input.closest('main') || document;
            var scope = container.querySelector('[data-search-scope]') || container;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
                });
            });
        });
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q');
        if (!keyword) {
            return;
        }
        var input = document.querySelector('[data-search-input]');
        if (!input) {
            return;
        }
        input.value = keyword;
        input.dispatchEvent(new Event('input'));
    }

    function initPlayer() {
        var video = document.querySelector('[data-hls-src]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-hls-src');
        var button = document.querySelector('[data-play-button]');
        var hlsInstance = null;
        var loaded = false;

        function attach() {
            if (loaded || !source) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function initScrollPlay() {
        var links = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-play]'));
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                var button = document.querySelector('[data-play-button]');
                window.setTimeout(function () {
                    if (button) {
                        button.click();
                    }
                }, 300);
            });
        });
    }
})();
