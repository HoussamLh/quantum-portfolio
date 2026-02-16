/**
 * QuantumSD Scroll Reveal
 */
function initScrollReveal() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((el) => {
        observer.observe(el);
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }
}

/** * Spotlight: Show Project Details
 */
function showProject(card, shouldScroll = false) {
    if (!card) return;

    const spotlightSection = document.getElementById('project-spotlight');
    const spotlightContent = document.getElementById('spotlight-content');
    if (!spotlightSection || !spotlightContent) return; // Safety check

    // 1. Extract data
    const title = card.getAttribute('data-title');
    const category = card.getAttribute('data-category');
    const desc = card.getAttribute('data-desc');
    const img = card.getAttribute('data-image');
    const tagsAttr = card.getAttribute('data-tags');
    const tags = tagsAttr ? tagsAttr.split(',') : [];

    // 2. Update Elements
    const titleEl = document.getElementById('spotlight-title');
    const catEl = document.getElementById('spotlight-category');
    const descEl = document.getElementById('spotlight-desc');
    const imgEl = document.getElementById('spotlight-img');

    if (titleEl) titleEl.innerText = title;
    if (catEl) catEl.innerText = category;
    if (descEl) descEl.innerText = desc;
    if (imgEl) imgEl.src = img;

    // 3. Update Tags
    const tagsContainer = document.getElementById('spotlight-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const span = document.createElement('span');
            span.innerText = tag.trim();
            span.classList.add('tag');
            tagsContainer.appendChild(span);
        });
    }

    // 4. Reveal
    spotlightContent.style.display = 'block';
    spotlightSection.classList.add('active');
    spotlightSection.style.background = 'white';

    // 5. Conditional Scroll
    if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Portfolio Filter Logic
 */
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            projectCards.forEach(card => {
                const isMatch = filterValue === 'all' || card.classList.contains(filterValue);
                if (isMatch) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });
}

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMobileMenu();
    initPortfolioFilter();

    // Default project load (no scroll)
    const firstCard = document.querySelector('.project-card');
    if (firstCard) {
        showProject(firstCard, false);
    }
});