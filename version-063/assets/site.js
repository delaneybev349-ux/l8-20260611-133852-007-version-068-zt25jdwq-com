(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length || !searchInput) {
      return;
    }

    var keyword = normalize(searchInput.value);
    var category = categorySelect ? normalize(categorySelect.value) : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      var matched = matchKeyword && matchCategory;

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
    }

    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', filterCards);
  }
})();
