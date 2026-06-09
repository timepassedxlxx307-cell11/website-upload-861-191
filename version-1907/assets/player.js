(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

  players.forEach(function (player) {
    var video = player.querySelector('.player-video');
    var cover = player.querySelector('.player-cover');
    var message = player.querySelector('.player-message');
    var stream = player.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function fail() {
      if (message) {
        message.hidden = false;
      }
    }

    function attach(done) {
      if (attached) {
        done();
        return;
      }

      if (!video || !stream) {
        fail();
        return;
      }

      attached = true;
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        done();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          done();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            fail();
          }
        });
        return;
      }

      fail();
    }

    function play() {
      attach(function () {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        cover.classList.add('is-hidden');
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
