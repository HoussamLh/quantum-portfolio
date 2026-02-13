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
 * Spotlight: Show Project Details
 */
function showProject(card) {
    if (!card) return;

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

    // 3. Clear and add tags with spacing
    const tagsContainer = document.getElementById('spotlight-tags');
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.innerText = tag.trim();
        span.classList.add('tag'); // CSS class for spacing/styling
        tagsContainer.appendChild(span);
    });

    // 4. Reveal Spotlight section
    if (placeholder) placeholder.style.display = 'none';
    spotlightContent.style.display = 'block';
    spotlightSection.style.border = 'none';
    spotlightSection.style.background = 'white';
    spotlightSection.classList.add('active');

    // 5. Scroll to the very top of the page smoothly
    scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * QuantumSD Portfolio Filter
 */
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            updateFilterButtons(filterButtons, button);
            filterProjectCards(projectCards, filterValue);
        });
    });
}

function updateFilterButtons(buttons, activeBtn) {
    buttons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function filterProjectCards(cards, filter) {
    cards.forEach(card => {
        const isMatch = filter === 'all' || card.classList.contains(filter);
        if (isMatch) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

/**
 * Hides the Project Spotlight
 */
function hideProject() {
    const spotlightSection = document.getElementById('project-spotlight');
    const spotlightContent = document.getElementById('spotlight-content');
    const placeholder = document.querySelector('.spotlight-placeholder');

    if (spotlightContent) spotlightContent.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    spotlightSection.classList.remove('active');

    // Scroll back to the grid smoothly
    const filters = document.querySelector('.portfolio-filters');
    if (filters) filters.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initPortfolioFilter();

    // Show first project by default
    const firstCard = document.querySelector('.project-card');
    if (firstCard) showProject(firstCard);
});