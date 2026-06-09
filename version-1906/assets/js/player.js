import { H as Hls } from './hls-vendor-dru42stk.js';

function showMessage(frame, message) {
  var messageBox = frame.querySelector('[data-player-message]');

  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.add('is-visible');
}

function setupPlayer(frame) {
  var video = frame.querySelector('video');
  var overlay = frame.querySelector('[data-player-overlay]');
  var source = frame.getAttribute('data-video-src');
  var initialized = false;
  var hlsInstance = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    showMessage(frame, '正在加载高清播放源…');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage(frame, '播放源连接异常，请稍后刷新页面重试。');
        }
      });

      return Promise.resolve();
    }

    showMessage(frame, '当前浏览器暂不支持 HLS 播放，请更换现代浏览器打开。');
    return Promise.reject(new Error('HLS is not supported.'));
  }

  function playVideo() {
    attachSource()
      .then(function () {
        overlay.classList.add('is-hidden');
        return video.play();
      })
      .catch(function () {
        showMessage(frame, '播放未能自动开始，请再次点击播放器或检查浏览器权限。');
      });
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('playing', function () {
    overlay.classList.add('is-hidden');
    var messageBox = frame.querySelector('[data-player-message]');
    if (messageBox) {
      messageBox.classList.remove('is-visible');
    }
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-video-src]').forEach(setupPlayer);
