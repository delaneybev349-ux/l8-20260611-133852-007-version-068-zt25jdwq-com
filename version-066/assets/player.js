document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.player-wrap').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-trigger');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var attached = false;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }

      video.src = stream;
      attached = true;
    }

    function playVideo() {
      attachStream();
      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
