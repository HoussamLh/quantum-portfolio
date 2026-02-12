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
 * Spotlight:  Show Project Details
 */

function showProject(card) {
    const spotlightSection = document.getElementById('project-spotlight');
    const spotlightContent = document.getElementById('spotlight-content');
    const placeholder = document.querySelector('.spotlight-placeholder');

    // 1. Extract data from the clicked card
    const title = card.getAttribute('data-title');
    const category = card.getAttribute('data-category');
    const desc = card.getAttribute('data-desc');
    const img = card.getAttribute('data-image');
    const tags = card.getAttribute('data-tags').split(',');

    // 2. Update the Spotlight elements
    document.getElementById('spotlight-title').innerText = title;
    document.getElementById('spotlight-category').innerText = category;
    document.getElementById('spotlight-desc').innerText = desc;
    document.getElementById('spotlight-img').src = img;

    // 3. Clear and add tags
    const tagsContainer = document.getElementById('spotlight-tags');
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.innerText = tag.trim();
        tagsContainer.appendChild(span);
    });

    // 4. Smooth UI Transition
    placeholder.style.display = 'none';
    spotlightContent.style.display = 'block';
    spotlightSection.style.border = 'none';
    spotlightSection.style.background = 'white';
    spotlightSection.classList.add('active');

    // 5. Scroll to top of spotlight so user sees it
    spotlightSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    showProject();
    });