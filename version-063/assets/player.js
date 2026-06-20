(function () {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var mask = player.querySelector('[data-play]');

    if (!video || !mask) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    function attachStream() {
      if (started || !stream) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on('hlsManifestParsed', function () {
          playVideo();
        });
        return;
      }

      video.src = stream;
      playVideo();
    }

    function start() {
      mask.classList.add('hidden');
      attachStream();
      playVideo();
    }

    mask.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
