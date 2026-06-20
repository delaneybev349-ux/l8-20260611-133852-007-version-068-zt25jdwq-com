(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");
        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener("click", function () {
                mobilePanel.hidden = !mobilePanel.hidden;
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var slideIndex = 0;
        var slideTimer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            slideIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === slideIndex);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === slideIndex);
            });
        }

        function startSlides() {
            if (slides.length < 2) {
                return;
            }
            slideTimer = window.setInterval(function () {
                showSlide(slideIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(slideTimer);
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startSlides();
            });
        });
        startSlides();

        var filterScopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        filterScopes.forEach(function (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-btn"));
            var container = scope.nextElementSibling;
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    cards.forEach(function (card) {
                        var type = card.getAttribute("data-type") || "";
                        var title = card.getAttribute("data-title") || "";
                        var match = value === "all" || type.indexOf(value) !== -1 || title.indexOf(value) !== -1;
                        card.classList.toggle("is-hidden", !match);
                    });
                });
            });
        });

        var videoFrame = document.querySelector("[data-play-url]");
        if (videoFrame) {
            var video = videoFrame.querySelector("video");
            var startButton = videoFrame.querySelector(".video-start");
            var status = document.querySelector(".player-status");
            var playUrl = videoFrame.getAttribute("data-play-url");
            var hlsPlayer = null;
            var prepared = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function prepareVideo() {
                if (!video || !playUrl || prepared) {
                    return;
                }
                prepared = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsPlayer = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30,
                        enableWorker: true
                    });
                    hlsPlayer.loadSource(playUrl);
                    hlsPlayer.attachMedia(video);
                    hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放线路连接中断，请稍后重试");
                        }
                    });
                } else {
                    video.src = playUrl;
                }
            }

            function playVideo() {
                prepareVideo();
                videoFrame.classList.add("is-playing");
                setStatus("正在加载播放");
                var playTask = video.play();
                if (playTask && typeof playTask.then === "function") {
                    playTask.then(function () {
                        setStatus("");
                    }).catch(function () {
                        setStatus("请再次点击播放");
                    });
                }
            }

            if (startButton && video) {
                startButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
                videoFrame.addEventListener("click", function (event) {
                    if (event.target === video) {
                        return;
                    }
                    playVideo();
                });
                video.addEventListener("play", function () {
                    videoFrame.classList.add("is-playing");
                    setStatus("");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        videoFrame.classList.remove("is-playing");
                    }
                });
            }
        }

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot && window.SITE_SEARCH_ITEMS) {
            var params = new URLSearchParams(window.location.search);
            var input = searchRoot.querySelector("input[name='q']");
            var results = searchRoot.querySelector("[data-search-results]");
            var empty = searchRoot.querySelector("[data-search-empty]");
            var query = params.get("q") || "";
            if (input) {
                input.value = query;
            }

            function cardHtml(item) {
                var tags = item.tags.slice(0, 3).map(function (tag) {
                    return "<span class=\"tag\">" + escapeHtml(tag) + "</span>";
                }).join("");
                return "<article class=\"movie-card\">" +
                    "<a class=\"poster\" href=\"" + item.url + "\" style=\"--poster-image: url('" + item.cover + "');\" aria-label=\"" + escapeHtml(item.title) + "\">" +
                    "<span class=\"poster-layer\"></span>" +
                    "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>" +
                    "<span class=\"poster-play\">▶</span>" +
                    "</a>" +
                    "<div class=\"movie-card-body\">" +
                    "<a class=\"movie-title\" href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a>" +
                    "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.genre) + "</p>" +
                    "<p class=\"movie-line\">" + escapeHtml(item.line) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                    "</div>" +
                    "</article>";
            }

            function escapeHtml(value) {
                return String(value).replace(/[&<>"]/g, function (char) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;"
                    }[char];
                });
            }

            function runSearch(value) {
                var word = value.trim().toLowerCase();
                var matched = window.SITE_SEARCH_ITEMS.filter(function (item) {
                    if (!word) {
                        return true;
                    }
                    return item.text.indexOf(word) !== -1;
                }).slice(0, 80);
                if (results) {
                    results.innerHTML = matched.map(cardHtml).join("");
                }
                if (empty) {
                    empty.hidden = matched.length > 0;
                }
            }

            runSearch(query);
        }
    });
})();
