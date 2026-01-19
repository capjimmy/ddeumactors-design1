/* ===============================================
   뜸 연기학원 - 메인 JavaScript
   =============================================== */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initMobileNav();
  initHeroSlider();
  initScrollAnimations();
  initSmoothScroll();
});

/* ===== Header Scroll Effect ===== */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/* ===== Mobile Navigation ===== */
function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;

  if (!menuToggle || !mobileNav) return;

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    body.classList.toggle('nav-open');
  });

  // Close on link click
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      body.classList.remove('nav-open');
    });
  });

  // Mobile dropdown toggle
  const dropdownToggles = mobileNav.querySelectorAll('.mobile-nav-item.has-dropdown > .mobile-nav-link');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.parentElement;
      parent.classList.toggle('open');
    });
  });
}

/* ===== Hero Slider ===== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  // Dot click
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      showSlide(index);
      startAutoPlay();
    });
  });

  // Start auto play
  if (slides.length > 1) {
    startAutoPlay();
  }
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.scroll-animate');

  if (animateElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => observer.observe(el));
}

/* ===== Smooth Scroll ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ===== Google Sheets CSV Parser ===== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur.length || row.length) {
        row.push(cur.trim());
        rows.push(row);
      }
      cur = '';
      row = [];
      continue;
    }
    cur += ch;
  }

  if (cur.length || row.length) {
    row.push(cur.trim());
    rows.push(row);
  }

  return rows;
}

/* ===== Escape HTML ===== */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===== Load Data from Google Sheets ===== */
async function loadSheetData(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const csv = await response.text();
    return parseCSV(csv);
  } catch (error) {
    console.error('Failed to load sheet data:', error);
    return [];
  }
}

/* ===== Export Functions ===== */
window.DdeumActors = {
  parseCSV,
  escapeHTML,
  loadSheetData
};
