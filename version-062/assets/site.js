(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        var activate = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        activate(0);
        start();
    }

    var filterForms = document.querySelectorAll('[data-local-filter]');

    filterForms.forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var select = form.querySelector('[data-type-filter]');
        var list = document.querySelector('[data-search-list]');
        var empty = document.querySelector('[data-empty-state]');

        if (!list) {
            return;
        }

        var items = Array.prototype.slice.call(list.querySelectorAll('.searchable-item'));

        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var typeValue = select ? select.value.trim() : '';
            var visible = 0;

            items.forEach(function (item) {
                var searchText = item.getAttribute('data-search') || '';
                var typeText = item.getAttribute('data-type') || '';
                var matchedQuery = !query || searchText.indexOf(query) !== -1;
                var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1;
                var show = matchedQuery && matchedType;

                item.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        if (select) {
            select.addEventListener('change', apply);
        }

        var url = new URL(window.location.href);
        var q = url.searchParams.get('q');

        if (q && input) {
            input.value = q;
        }

        apply();
    });

    var players = document.querySelectorAll('.stream-player');

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-cover');
        var source = player.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        var begin = function () {
            if (!video || !source) {
                return;
            }

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }

                started = true;
            }

            player.classList.add('playing');
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (button) {
            button.addEventListener('click', begin);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    begin();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
