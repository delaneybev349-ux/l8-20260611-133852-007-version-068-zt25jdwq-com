(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var frame = document.querySelector("[data-player]");
        if (!frame) {
            return;
        }
        var video = frame.querySelector("video");
        var button = frame.querySelector(".player-start");
        var message = frame.querySelector("[data-player-message]");
        var stream = video ? video.getAttribute("data-stream") : "";
        var hls = null;
        var loaded = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function showButton(show) {
            if (button) {
                button.classList.toggle("hidden", !show);
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            var action = video.play();
            if (action && typeof action.then === "function") {
                action.then(function () {
                    showButton(false);
                    setMessage("");
                }).catch(function () {
                    showButton(true);
                    setMessage("请点击播放按钮开始观看");
                });
            } else {
                showButton(false);
                setMessage("");
            }
        }

        function attachStream() {
            if (!video || !stream) {
                setMessage("播放暂时无法加载，请稍后重试");
                return;
            }
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            setMessage("正在加载播放内容...");
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setMessage("播放暂时无法加载，请稍后重试");
                        showButton(true);
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
            } else {
                video.src = stream;
                video.addEventListener("canplay", playVideo, { once: true });
            }
        }

        if (button) {
            button.addEventListener("click", attachStream);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    attachStream();
                }
            });
            video.addEventListener("play", function () {
                showButton(false);
                setMessage("");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    showButton(true);
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
