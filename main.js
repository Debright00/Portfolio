/* RENDERING LOGIC: Content lives in data.js; this file only builds the interface. */
const iconMap = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.9c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4 9h3v11H4V9Zm5 0h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V20h-3v-5.73c0-1.37-.02-3.13-1.91-3.13-1.91 0-2.2 1.49-2.2 3.03V20H9V9Z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.26l-4.9-6.4L6.45 22H3.34l7.24-8.28L2.8 2h6.42l4.43 5.86L18.9 2Zm-1.1 17.8h1.73L8.28 4.08H6.43L17.8 19.8Z"/></svg>'
};

function renderExperience() {
  document.querySelector('#experience-list').innerHTML = portfolioData.experience.map((item, index) => `
    <article class="experience-item">
      <div class="experience-marker">0${index + 1}</div>
      <div class="experience-main">
        <button class="experience-toggle" type="button" aria-expanded="false">
          <span class="experience-meta"><span>${item.period}</span><span>${item.context}</span></span>
          <span class="experience-title-row"><span><span class="experience-role">${item.role}</span><span class="experience-org">${item.organization}</span></span><span class="expand-icon" aria-hidden="true">+</span></span>
        </button>
        <div class="experience-details"><ul>${item.responsibilities.map(responsibility => `<li>${responsibility}</li>`).join('')}</ul></div>
      </div>
    </article>`).join('');

  document.querySelectorAll('.experience-toggle').forEach(button => button.addEventListener('click', () => {
    const item = button.closest('.experience-item');
    const isOpen = item.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(isOpen));
  }));
}

function renderEducation() {
  document.querySelector('#education-list').innerHTML = portfolioData.education.map((item, index) => `
    <article class="education-item">
      <div class="experience-marker">0${index + 1}</div>
      <div><h3>${item.school}</h3><p>${item.qualification} <span>${item.period}</span></p></div>
    </article>`).join('');
}

// Shared expandable card renderer for coding projects and data analysis entries.
function renderCards(entries, targetSelector) {
  document.querySelector(targetSelector).innerHTML = entries.map((card, index) => {
    const normalizedImageSet = Array.isArray(card.images)
      ? card.images
      : Array.isArray(card.image)
        ? card.image
        : [card.image].filter(Boolean);
    const imageSet = normalizedImageSet.length ? normalizedImageSet : ["assets/placeholder.png"];
    const galleryButtons = imageSet.length > 1 ? `
      <div class="gallery-controls" aria-label="Image navigation">
        <button class="gallery-button gallery-prev" type="button" aria-label="Previous image">←</button>
        <span class="gallery-status">Image 1 / ${imageSet.length}</span>
        <button class="gallery-button gallery-next" type="button" aria-label="Next image">→</button>
      </div>
    ` : '';

    return `
      <article class="project-card" data-card-index="${index}" data-gallery-images="${imageSet.join('|')}" data-gallery-index="0">
        <div class="card-visual">
          <button class="card-toggle" type="button" aria-expanded="false">
            <span class="card-image"><img src="${imageSet[0]}" alt="" loading="lazy"><span class="card-index">0${index + 1}</span></span>
            <span class="card-summary"><span class="card-title-row"><strong>${card.title}</strong><span class="expand-icon" aria-hidden="true">+</span></span><span class="card-pitch">${card.pitch}</span><span class="tag-list">${card.tags.map(tag => `<span>${tag}</span>`).join('')}</span></span>
          </button>
          ${galleryButtons}
        </div>
        <div class="card-details"><div class="card-details-inner"><p>${card.description}</p>${card.linkUrl ? `<a class="button button-small" href="${card.linkUrl}" target="_blank" rel="noopener">${card.linkLabel} <span aria-hidden="true">↗</span></a>` : ''}</div></div>
        ${card.datasetUrl ? `<a class="dataset-download" href="${card.datasetUrl}" download>Download Dataset <span aria-hidden="true">↓</span></a>` : ''}
      </article>`;
  }).join('');

  document.querySelectorAll(`${targetSelector} .card-toggle`).forEach(button => button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    const isOpen = card.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(isOpen));
  }));

  document.querySelectorAll(`${targetSelector} .gallery-button`).forEach(button => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const card = button.closest('.project-card');
    const images = card.dataset.galleryImages ? card.dataset.galleryImages.split('|') : [];
    let currentIndex = Number(card.dataset.galleryIndex || 0);

    if (button.classList.contains('gallery-prev')) {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
    } else {
      currentIndex = (currentIndex + 1) % images.length;
    }

    card.dataset.galleryIndex = String(currentIndex);
    const image = card.querySelector('.card-image img');
    if (image) image.src = images[currentIndex];

    const status = card.querySelector('.gallery-status');
    if (status) status.textContent = `Image ${currentIndex + 1} / ${images.length}`;
  }));
}

function renderCertifications() {
  document.querySelector('#certifications-list').innerHTML = portfolioData.certifications.map((certification, index) => {
    const hasCertificateLink = certification.link && !certification.link.startsWith('[');
    const content = `<span class="certification-number">0${index + 1}</span><span>${certification.title}</span><span class="certification-arrow">↗</span>`;
    return hasCertificateLink
      ? `<a class="certification-item" href="${certification.link}" target="_blank" rel="noopener">${content}</a>`
      : `<div class="certification-item">${content}</div>`;
  }).join('');
}

function renderSocials() {
  document.querySelector('#social-links').innerHTML = Object.entries(portfolioData.socials).map(([network, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${network}">${iconMap[network]}</a>`).join('');
}

renderExperience();
renderEducation();
renderCards(portfolioData.codingProjects, '#coding-projects');
renderCards(portfolioData.dataAnalysis, '#data-analysis');
renderCertifications();
renderSocials();
document.querySelector('#current-year').textContent = new Date().getFullYear();
