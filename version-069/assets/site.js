(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
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

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function (panel) {
        var list = document.querySelector('[data-filter-list]');
        var input = panel.querySelector('[data-filter-input]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && input && !input.value) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            if (!list) {
                return;
            }

            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var matchedType = !type || cardType === type;
                card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }

                if (yearSelect) {
                    yearSelect.value = '';
                }

                if (typeSelect) {
                    typeSelect.value = '';
                }

                applyFilter();
            });
        }

        applyFilter();
    });
})();
