(function () {
    var video = document.querySelector('[data-video-player]');
    var trigger = document.querySelector('[data-play-trigger]');
    var status = document.querySelector('[data-player-status]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-stream-button]'));
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function selectedStream() {
        var active = document.querySelector('[data-stream-button].is-active');
        return (active && active.getAttribute('data-stream')) || video.getAttribute('data-stream') || '';
    }

    function playStream(stream) {
        if (!stream) {
            setStatus('播放线路暂不可用');
            return;
        }

        setStatus('正在加载');

        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().then(function () {
                setStatus('正在播放');
            }).catch(function () {
                setStatus('点击视频继续播放');
            });
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                    setStatus('正在播放');
                }).catch(function () {
                    setStatus('点击视频继续播放');
                });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
                setStatus('播放遇到问题，请稍后重试');
            });
        } else {
            video.src = stream;
            video.play().then(function () {
                setStatus('正在播放');
            }).catch(function () {
                setStatus('点击视频继续播放');
            });
        }

        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            buttons.forEach(function (item) {
                item.classList.remove('is-active');
            });

            button.classList.add('is-active');
            playStream(button.getAttribute('data-stream'));
        });
    });

    if (trigger) {
        trigger.addEventListener('click', function () {
            playStream(selectedStream());
        });
    }

    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (trigger && !video.ended) {
            trigger.classList.remove('is-hidden');
        }
    });
})();
