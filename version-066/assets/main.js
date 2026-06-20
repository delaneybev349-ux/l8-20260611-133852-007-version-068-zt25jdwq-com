(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    startAutoPlay();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
    var container = panel.parentElement || document;
    var input = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card, .ranking-item'));

    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-item'));
    }

    function valueOf(selectName) {
      var select = panel.querySelector('[data-filter-select="' + selectName + '"]');
      return select ? select.value.trim() : '';
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = valueOf('type');
      var region = valueOf('region');
      var year = valueOf('year');

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
        var matchesRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
        var matchesYear = !year || (card.getAttribute('data-year') || '') === year;

        card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesRegion && matchesYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  });
})();
