(function () {
    function attach(video, source) {
        if (video.dataset.ready === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var stream = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            stream.loadSource(source);
            stream.attachMedia(video);
            video._stream = stream;
        } else {
            video.src = source;
        }

        video.dataset.ready = '1';
    }

    function start(frame, video, source) {
        attach(video, source);
        frame.classList.add('is-playing');
        var playRequest = video.play();

        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-video');

        if (!source) {
            return;
        }

        if (button) {
            button.addEventListener('click', function () {
                start(frame, video, source);
            });
        }

        video.addEventListener('click', function () {
            if (video.dataset.ready !== '1') {
                start(frame, video, source);
            }
        });

        video.addEventListener('play', function () {
            frame.classList.add('is-playing');
        });
    });
}());
