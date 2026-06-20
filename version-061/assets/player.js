import { H as Hls } from './hls-vendor.js';

const players = document.querySelectorAll('.player-box');

players.forEach((box) => {
  const video = box.querySelector('video');
  const button = box.querySelector('[data-play-button]');
  const streamUrl = video ? video.dataset.stream : '';
  let initialized = false;

  const begin = async () => {
    if (!video || !streamUrl) {
      return;
    }

    if (!initialized) {
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    if (button) {
      button.classList.add('hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (button) {
        button.classList.remove('hidden');
      }
    }
  };

  if (button) {
    button.addEventListener('click', begin);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', () => {
      if (button) {
        button.classList.add('hidden');
      }
    });
  }
});
