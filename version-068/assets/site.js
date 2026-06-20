(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var keyword = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                if (keyword) {
                    window.location.href = target + "?q=" + encodeURIComponent(keyword);
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initRails() {
        document.querySelectorAll("[data-rail-prev]").forEach(function (button) {
            button.addEventListener("click", function () {
                var rail = document.querySelector("[data-rail='" + button.getAttribute("data-rail-prev") + "']");
                if (rail) {
                    rail.scrollBy({ left: -420, behavior: "smooth" });
                }
            });
        });
        document.querySelectorAll("[data-rail-next]").forEach(function (button) {
            button.addEventListener("click", function () {
                var rail = document.querySelector("[data-rail='" + button.getAttribute("data-rail-next") + "']");
                if (rail) {
                    rail.scrollBy({ left: 420, behavior: "smooth" });
                }
            });
        });
    }

    function initFilter() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var textInput = panel.querySelector("[data-filter-text]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-filter-empty]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                var okText = !keyword || haystack.indexOf(keyword) !== -1;
                var okType = !type || card.getAttribute("data-type") === type;
                var okYear = !year || card.getAttribute("data-year") === year;
                var show = okText && okType && okYear;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [textInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function queryValue(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    function renderSearchCard(item) {
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"./" + item.url + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<span class=\"card-badge\">" + escapeHtml(item.category) + "</span>",
            "<span class=\"play-hover\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"./" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>",
            "<p>" + escapeHtml(item.oneLine) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
            "<div class=\"movie-tags\"><span>" + escapeHtml(item.genre) + "</span><span>" + escapeHtml(item.score) + "分</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-page-form]");
        var input = form ? form.querySelector("input[name='q']") : null;
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var empty = document.querySelector("[data-search-empty]");
        var index = window.SITE_SEARCH_INDEX || [];
        if (!form || !input || !results) {
            return;
        }

        function search(keyword) {
            var clean = keyword.trim().toLowerCase();
            input.value = keyword.trim();
            if (!clean) {
                results.innerHTML = "";
                if (summary) {
                    summary.textContent = "";
                }
                if (empty) {
                    empty.textContent = "请输入关键词开始搜索";
                    empty.classList.add("show");
                }
                return;
            }
            var matched = index.filter(function (item) {
                return item.searchText.indexOf(clean) !== -1;
            }).slice(0, 96);
            results.innerHTML = matched.map(renderSearchCard).join("");
            if (summary) {
                summary.textContent = matched.length ? "已找到相关影片" : "没有找到匹配的影片";
            }
            if (empty) {
                empty.textContent = "没有找到匹配的影片";
                empty.classList.toggle("show", matched.length === 0);
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var keyword = input.value.trim();
            var url = keyword ? "./search.html?q=" + encodeURIComponent(keyword) : "./search.html";
            history.replaceState(null, "", url);
            search(keyword);
        });
        search(queryValue("q"));
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initRails();
        initFilter();
        initSearchPage();
    });
})();
