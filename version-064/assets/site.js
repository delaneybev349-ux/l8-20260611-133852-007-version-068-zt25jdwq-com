(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function uniqueValues(cards, name) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(name) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
    return values;
  }

  function addOptions(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var search = panel.querySelector("[data-filter-search]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var count = panel.querySelector("[data-filter-count]");
    addOptions(typeSelect, uniqueValues(cards, "data-type"));
    addOptions(regionSelect, uniqueValues(cards, "data-region"));
    addOptions(yearSelect, uniqueValues(cards, "data-year"));
    var params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) {
      search.value = params.get("q");
    }
    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var match = true;
        if (query && text.indexOf(query) === -1) {
          match = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          match = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          match = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          match = false;
        }
        if (category && card.getAttribute("data-category") !== category) {
          match = false;
        }
        card.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }
    [search, typeSelect, regionSelect, yearSelect, categorySelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        window.location.href = query ? "./movies.html?q=" + encodeURIComponent(query) : "./movies.html";
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupGlobalSearch();
  });
})();

function initPlayer(source) {
  var video = document.querySelector("[data-player]");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-play-button]");
  if (!video || !source) {
    return;
  }
  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function play() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener("click", play);
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      play();
    }
  });
}
