const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

const sliders = document.querySelectorAll('[data-slider]');

sliders.forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slideDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide(current + 1);
    }, 5200);
  }
});

const searchInput = document.querySelector('[data-search-input]');
const sortSelect = document.querySelector('[data-sort-select]');
const cardContainer = document.querySelector('.movie-grid') || document.querySelector('.rank-list');
const emptyState = document.querySelector('[data-empty-state]');

const normalize = (value) => String(value || '').trim().toLowerCase();

const getSearchText = (item) => [
  item.dataset.title,
  item.dataset.year,
  item.dataset.region,
  item.dataset.type,
  item.dataset.tags
].map(normalize).join(' ');

const applyListingState = () => {
  if (!cardContainer) {
    return;
  }

  const query = normalize(searchInput ? searchInput.value : '');
  const items = Array.from(cardContainer.children).filter((node) => {
    return node.matches('.movie-card') || node.matches('.rank-item');
  });

  items.forEach((item) => {
    item.hidden = query && !getSearchText(item).includes(query);
  });

  const visibleItems = items.filter((item) => !item.hidden);

  if (sortSelect && cardContainer.classList.contains('movie-grid')) {
    const sorted = [...items].sort((a, b) => {
      const value = sortSelect.value;
      const yearA = Number(a.dataset.year || 0);
      const yearB = Number(b.dataset.year || 0);
      const titleA = normalize(a.dataset.title);
      const titleB = normalize(b.dataset.title);

      if (value === 'year-asc') {
        return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
      }

      if (value === 'title') {
        return titleA.localeCompare(titleB, 'zh-CN');
      }

      return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
    });

    sorted.forEach((item) => cardContainer.appendChild(item));
  }

  if (emptyState) {
    emptyState.style.display = visibleItems.length === 0 ? 'block' : 'none';
  }
};

if (searchInput) {
  searchInput.addEventListener('input', applyListingState);

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery) {
    searchInput.value = initialQuery;
  }
}

if (sortSelect) {
  sortSelect.addEventListener('change', applyListingState);
}

applyListingState();
