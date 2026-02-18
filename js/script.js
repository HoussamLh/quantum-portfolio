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
/**
 * QuantumSD Highlight Current Page
 */
function highlightCurrentPage() {
    let path = window.location.pathname;
    let currentPage = path.split("/").pop();

    // Fix: If on root or index, make it index.html
    if (currentPage === "" || currentPage === "/" || path.endsWith("/")) {
        currentPage = "index.html";
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        // Check if href includes the currentPage string
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * QuantumSD Auto-Select Service
 */
function autoSelectService() {
    const queryParams = new URLSearchParams(window.location.search);
    const serviceRequested = queryParams.get('service');

    if (serviceRequested) {
        const selectElement = document.getElementById('service-select');
        if (selectElement) {
            selectElement.value = serviceRequested;
        }
    }
}

/**
 * QuantumSD Contact Form Handler
 */
function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    const successModal = document.getElementById("success-modal");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const submitBtn = contactForm.querySelector(".submit-btn");
        const formData = new FormData(event.target);
        const formDataObj = Object.fromEntries(formData.entries());

        // 1. Frontend Honeypot Guard: Block spam without a server request
        if (formDataObj.honeypot && formDataObj.honeypot !== "") {
            console.warn("Spam attempt blocked on frontend.");
            return;
        }

        // 2. UI Feedback: Disable button and show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        try {
            // 3. API Call: Using relative path for Vercel
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formDataObj)
            });

            if (response.ok) {
                // 4. Success: Show modal and clear form
                if (successModal) successModal.classList.add('active');
                contactForm.reset();
            } else {
                // 5. Server Error: Handle specific error messages
                let errorMessage = "Something went wrong";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) { /* Fallback to default */ }

                alert("Error: " + errorMessage);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Connection error: Could not reach the server.");
        } finally {
            // 6. Restore Button State
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // 7. Modal Closing Logic
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            // Only close if user clicks the dark overlay background
            if (e.target.id === "success-modal") {
                closeModal();
            }
        });
    }
}

/** 
 ** Spotlight: Show Project Details
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
    // 3. Map your Portfolio Categories to your Contact Form Option Values
    const categoryMap = {
        'Custom Web Development': 'web-dev',
        'UI/UX Design': 'uiux',
        'E-Commerce Solutions': 'ecommerce',
        'SEO & Data Optimization': 'seo',
        'Software Architecture': 'software',
        'Brand Identity & Logo': 'branding'
    };
    
    const serviceKey = categoryMap[category] || 'web-dev';

    // 4. Update the button link
    const spotlightLink = document.getElementById('spotlight-link');
    if (spotlightLink) {
        spotlightLink.href = `contact.html?service=${serviceKey}`;
    }


    // 6. Reveal
    spotlightContent.style.display = 'block';
    spotlightSection.classList.add('active');
    spotlightSection.style.background = 'white';

    // 7. Conditional Scroll
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
 * Hides the Project Spotlight
 */
function hideProject() {
    const spotlightSection = document.getElementById('project-spotlight');
    const spotlightContent = document.getElementById('spotlight-content');
    const placeholder = document.querySelector('.spotlight-placeholder');

    spotlightContent.style.display = 'none';
    placeholder.style.display = 'block';
    spotlightSection.classList.remove('active');

    // Optional: scroll back to the grid
    document.querySelector('.portfolio-filters').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMobileMenu();
    initPortfolioFilter();
    initContactForm();
    autoSelectService();
    highlightCurrentPage();

    // Default project load (no scroll)
    const firstCard = document.querySelector('.project-card');
    if (firstCard) {
        showProject(firstCard, false);
    }
});