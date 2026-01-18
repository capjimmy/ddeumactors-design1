/* ===============================================
   뜸 연기학원 - Main JavaScript
   =============================================== */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // Mobile dropdown toggle
  const mobileDropdowns = document.querySelectorAll('.mobile-nav-item.has-dropdown');
  mobileDropdowns.forEach(item => {
    const link = item.querySelector('.mobile-nav-link');
    link.addEventListener('click', function(e) {
      e.preventDefault();
      item.classList.toggle('active');
    });
  });

  // Scroll animations
  initScrollAnimations();
});

// Initialize scroll animations
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.scroll-animate');

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

// Escape HTML utility
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CSV Parser
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

// Export utilities
window.escapeHTML = escapeHTML;
window.parseCSV = parseCSV;
window.initScrollAnimations = initScrollAnimations;
