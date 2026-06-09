(function () {
  function initMoviePlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }

    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      loaded = true;
    }

    function start() {
      attach();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
