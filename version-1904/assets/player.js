import { H as Hls } from './hls-vendor.js';

export function setupPlayer(videoId, buttonId, source) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  let loaded = false;
  let hls = null;

  if (!video || !button || !source) {
    return;
  }

  const attachSource = () => {
    if (loaded) {
      return;
    }

    loaded = true;
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const play = () => {
    attachSource();
    button.classList.add('is-hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        button.classList.remove('is-hidden');
      });
    }
  };

  button.addEventListener('click', play);
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
