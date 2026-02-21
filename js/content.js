function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function reInitAfterDynamicRender() {
  if (typeof initScrollReveal === "function") initScrollReveal();
  if (typeof initPortfolioFilter === "function") initPortfolioFilter();

  const firstCard = document.querySelector(".project-card");
  if (firstCard && typeof showProject === "function") {
    showProject(firstCard, false);
  }
}

async function renderServices() {
  const root = document.getElementById("services-sections");
  if (!root) return;
  const items = await loadJson("/data/services.json");

  const grouped = {};
  items.forEach((item) => {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  });

  root.innerHTML = Object.entries(grouped).map(([section, list], idx) => {
    const cards = list.map((s) => `
      <div class="service-card reveal">
        <i class="${escapeHtml(s.icon)}"></i>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description)}</p>
        ${s.contactService ? `<a href="contact.html?service=${encodeURIComponent(s.contactService)}" class="service-link">Start Project →</a>` : ""}
      </div>
    `).join("");

    return `<h3 class="section-title reveal">0${idx + 1}. ${escapeHtml(section)}</h3><div class="services-grid">${cards}</div>`;
  }).join("");
}

async function renderProjects() {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;
  const items = await loadJson("/data/projects.json");

  grid.innerHTML = items.map((p) => {
    const tags = (p.tags || []).join(",");
    return `
      <div class="project-card reveal ${escapeHtml(p.filter)}" onclick="showProject(this, true)"
        data-title="${escapeHtml(p.title)}"
        data-category="${escapeHtml(p.category)}"
        data-desc="${escapeHtml(p.description)}"
        data-image="${escapeHtml(p.image)}"
        data-tags="${escapeHtml(tags)}">
        <div class="project-image">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" />
          <div class="project-overlay">
            <div class="overlay-text">
              <h3>${escapeHtml(p.title)}</h3>
              <p>${escapeHtml(p.category)}</p>
              <span class="view-project">View Case Study</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([renderServices(), renderProjects()]);
    reInitAfterDynamicRender();
  } catch (e) {
    console.error("Content loading error:", e);
    const servicesRoot = document.getElementById("services-sections");
    const portfolioRoot = document.getElementById("portfolio-grid");
    if (servicesRoot) servicesRoot.innerHTML = '<p class="content-error">Unable to load services right now.</p>';
    if (portfolioRoot) portfolioRoot.innerHTML = '<p class="content-error">Unable to load projects right now.</p>';
  }
});
