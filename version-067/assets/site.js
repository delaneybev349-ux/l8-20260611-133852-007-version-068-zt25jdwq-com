(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.hasAttribute('hidden');
      if (isOpen) {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });
    restart();
  }

  function setupFilters() {
    var input = document.querySelector('.filter-input');
    var list = document.querySelector('.filter-list');
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function applyFilter() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var text = item.getAttribute('data-search') || '';
        var matched = !value || text.indexOf(value) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (query) {
      input.value = query;
    }
    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var source = shell.getAttribute('data-src');
      var initialized = false;
      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (initialized) {
          return;
        }
        initialized = true;
        if (source.indexOf('.m3u8') !== -1) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        var promise = video.paused ? video.play() : video.pause();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', playVideo);
      }
      video.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
    setupPlayers();
  });
})();
