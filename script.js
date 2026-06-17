/* ─── script.js ─── MSCW Bureau Presentation ─── */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     LANGUAGE SWITCHER
  ══════════════════════════════════════════ */
  let currentLang = 'ru';

  const langBtn   = document.getElementById('langBtn');
  const langLabel = document.getElementById('langLabel');

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    langLabel.textContent = lang === 'ru' ? 'EN' : 'RU';

    document.querySelectorAll('[data-ru]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (!text) return;
      // Use innerHTML to support <strong> tags inside translations
      el.innerHTML = text;
    });
  }

  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    applyLanguage(currentLang);
  });

  // Apply default Russian on load
  applyLanguage('ru');


  /* ══════════════════════════════════════════
     NAVBAR — SCROLL EFFECT
  ══════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  /* ══════════════════════════════════════════
     SMOOTH SCROLL — NAV LINKS
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ══════════════════════════════════════════
     SCROLL FADE-IN ANIMATIONS
  ══════════════════════════════════════════ */
  const fadeTargets = [
    // Section tags, titles, subtitles
    ...document.querySelectorAll('.section-tag'),
    ...document.querySelectorAll('.section-title'),
    ...document.querySelectorAll('.section-subtitle'),
    // Cards
    ...document.querySelectorAll('.disclaimer-card'),
    ...document.querySelectorAll('.concept-intro-text'),
    ...document.querySelectorAll('.gallery-item'),
    ...document.querySelectorAll('.drawing-card'),
    ...document.querySelectorAll('.deliverable-card'),
  ];

  fadeTargets.forEach((el, i) => {
    el.classList.add('fade-in');
    // Stagger cards in the same parent
    const siblings = Array.from(el.parentElement.children).filter(c => c === el || c.classList.contains(el.classList[0]));
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx < 6) {
      el.classList.add(`fade-in-delay-${idx}`);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeTargets.forEach(el => observer.observe(el));


  /* ══════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════ */
  const lightbox         = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg      = document.getElementById('lightboxImg');
  const lightboxCaption  = document.getElementById('lightboxCaption');
  const lightboxClose    = document.getElementById('lightboxClose');
  const lightboxPrev     = document.getElementById('lightboxPrev');
  const lightboxNext     = document.getElementById('lightboxNext');

  // Build image data array from gallery items
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const images = galleryItems.map(item => ({
    src:     item.querySelector('img').src,
    alt:     item.querySelector('img').alt,
    caption: item.querySelector('.gallery-caption h4')?.textContent || '',
    num:     item.querySelector('.gallery-num')?.textContent || '',
  }));

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    showImage(currentIndex);
    lightbox.classList.add('active');
    lightboxBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    const img = images[index];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = `${img.num}  ${img.caption}`;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  // Attach click to gallery items
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    // PDF modal takes priority when open
    if (pdfModal && pdfModal.classList.contains('active')) {
      if (e.key === 'Escape') closePdf();
      return;
    }
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  // Touch / swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }
  });


  /* ══════════════════════════════════════════
     PDF VIEWER MODAL
  ══════════════════════════════════════════ */
  const pdfModal         = document.getElementById('pdfModal');
  const pdfModalBackdrop = document.getElementById('pdfModalBackdrop');
  const pdfFrame         = document.getElementById('pdfFrame');
  const pdfModalClose    = document.getElementById('pdfModalClose');
  const pdfCard          = document.getElementById('phase1PdfCard');

  // URL-encode the path so the browser serves it with the built-in viewer
  // (toolbar params enable pan/zoom via the native PDF UI).
  const PDF_SRC = 'Phase%20One/Civil3D%20PDF%20siteplan%20Further%20comments.pdf#view=FitH';

  function openPdf() {
    pdfFrame.src = PDF_SRC;
    pdfModal.classList.add('active');
    pdfModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePdf() {
    pdfModal.classList.remove('active');
    pdfModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    // Clear src to stop the PDF from rendering in the background
    pdfFrame.src = '';
  }

  if (pdfCard) {
    pdfCard.addEventListener('click', openPdf);
    pdfCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPdf(); }
    });
  }

  pdfModalClose.addEventListener('click', closePdf);
  pdfModalBackdrop.addEventListener('click', closePdf);

  /* ══════════════════════════════════════════
     PARALLAX — HERO BG (subtle)
  ══════════════════════════════════════════ */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.2}px)`;
    }, { passive: true });
  }

});
