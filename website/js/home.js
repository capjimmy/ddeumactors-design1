/* ===============================================
   뜸 연기학원 - 홈페이지 JavaScript
   =============================================== */

// Google Sheets URLs
const SHEET_URLS = {
  metrics: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=2046441648&single=true&output=csv",
  names: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=0&single=true&output=csv",
  universities: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=1842660855&single=true&output=csv"
};

const COLS = 4;
const VISIBLE_ROWS = 5;
const MAX_ITEMS = 400;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Home.js loaded - starting data load');
  loadMetrics();
  loadNames();
  loadUniversities();
});

/* ===== CSV Parser ===== */
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
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===== Check if Header Row ===== */
function isLikelyHeaderRow(label, value) {
  const s = (String(label || '') + ' ' + String(value || '')).toLowerCase();
  return s.includes('label') || s.includes('value') || s.includes('항목') || s.includes('값') || s.includes('지표');
}

function isLikelyHeader(cell) {
  const s = String(cell || '').trim().toLowerCase();
  return s === '대학' || s === '대학명' || s === 'university' || s === '학교';
}

/* ===== Load Metrics ===== */
async function loadMetrics() {
  const grid = document.getElementById('dtmMetricsGrid');
  if (!grid) {
    console.log('Metrics grid not found');
    return;
  }

  grid.innerHTML = '<div class="loading-placeholder" style="text-align:center;padding:40px;color:#999;">로딩중...</div>';

  try {
    console.log('Fetching metrics from:', SHEET_URLS.metrics);
    const res = await fetch(SHEET_URLS.metrics, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.status);
    }

    const csv = await res.text();
    console.log('Metrics CSV received:', csv.substring(0, 200));

    let rows = parseCSV(csv);
    console.log('Parsed rows:', rows);

    // A=label, B=value
    rows = rows
      .map(r => [(r[0] || '').trim(), (r[1] || '').trim()])
      .filter(r => r[0] || r[1]);

    // Remove header if exists
    if (rows.length && isLikelyHeaderRow(rows[0][0], rows[0][1])) {
      rows = rows.slice(1);
    }

    grid.innerHTML = '';

    if (rows.length === 0) {
      grid.innerHTML = '<div class="loading-placeholder" style="text-align:center;padding:40px;color:#999;">데이터가 없습니다.</div>';
      return;
    }

    // Render max 4 items
    rows.slice(0, 4).forEach(([label, value]) => {
      if (!label && !value) return;

      const card = document.createElement('div');
      card.className = 'metric-card scroll-animate';
      card.innerHTML = `
        <div class="metric-value">${escapeHTML(value)}</div>
        <div class="metric-label">${escapeHTML(label)}</div>
      `;
      grid.appendChild(card);
    });

    console.log('Metrics loaded successfully:', rows.length, 'items');

    // Trigger scroll animation
    initMetricsAnimation();
  } catch (error) {
    console.error('Failed to load metrics:', error);
    grid.innerHTML = '<div class="loading-placeholder" style="text-align:center;padding:40px;color:#c00;">데이터 로딩 실패: ' + error.message + '</div>';
  }
}

/* ===== Load Names (Rolling Grid) ===== */
async function loadNames() {
  const ul = document.getElementById('nameGrid');
  if (!ul) {
    console.log('Name grid not found');
    return;
  }

  try {
    console.log('Fetching names from:', SHEET_URLS.names);
    const res = await fetch(SHEET_URLS.names, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.status);
    }

    const csv = await res.text();
    console.log('Names CSV received:', csv.substring(0, 200));

    const lines = csv.trim().split('\n').map(l => l.replace(/"/g, '').trim());
    const colA = lines.map(l => (l.split(',')[0] || '').trim());

    let names = colA.filter((v, idx) => v && idx !== 0);
    console.log('Names parsed:', names.length, 'items');

    if (names.length === 0) {
      ul.innerHTML = '<li style="text-align:center;color:#999;">데이터가 없습니다.</li>';
      return;
    }

    // Align to 4 columns
    const rem = names.length % COLS;
    if (rem !== 0) {
      for (let i = 0; i < COLS - rem; i++) names.push('');
    }

    // Ensure minimum length
    const minNeeded = (VISIBLE_ROWS + 8) * COLS;
    while (names.length < minNeeded) {
      names = names.concat(names);
    }

    const original = names.slice(0, Math.min(names.length, MAX_ITEMS / 2));
    const doubled = original.concat(original);

    ul.innerHTML = '';
    doubled.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n;
      ul.appendChild(li);
    });

    // Calculate shift
    requestAnimationFrame(() => {
      const half = ul.scrollHeight / 2;
      ul.style.setProperty('--shift', half + 'px');
    });

    console.log('Names loaded successfully');
  } catch (error) {
    console.error('Failed to load names:', error);
    ul.innerHTML = '<li style="text-align:center;color:#c00;">데이터 로딩 실패</li>';
  }
}

// Resize handler for rolling names
window.addEventListener('resize', () => {
  const ul = document.getElementById('nameGrid');
  if (!ul || !ul.children.length) return;

  requestAnimationFrame(() => {
    const half = ul.scrollHeight / 2;
    ul.style.setProperty('--shift', half + 'px');
  });
});

/* ===== Load Universities ===== */
async function loadUniversities() {
  const ul = document.getElementById('dtmUnivGrid');
  if (!ul) {
    console.log('University grid not found');
    return;
  }

  ul.innerHTML = '<li style="text-align:center;color:#999;grid-column:span 4;">로딩중...</li>';

  try {
    console.log('Fetching universities from:', SHEET_URLS.universities);
    const res = await fetch(SHEET_URLS.universities, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.status);
    }

    const csv = await res.text();
    console.log('Universities CSV received:', csv.substring(0, 200));

    const rows = parseCSV(csv);

    // Use only column A
    let items = rows.map(r => (r[0] || '').trim()).filter(Boolean);

    // Remove header if exists
    if (items.length && isLikelyHeader(items[0])) {
      items = items.slice(1);
    }

    ul.innerHTML = '';

    if (items.length === 0) {
      ul.innerHTML = '<li style="text-align:center;color:#999;grid-column:span 4;">데이터가 없습니다.</li>';
      return;
    }

    items.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });

    console.log('Universities loaded successfully:', items.length, 'items');
  } catch (error) {
    console.error('Failed to load universities:', error);
    ul.innerHTML = '<li style="text-align:center;color:#c00;grid-column:span 4;">데이터 로딩 실패: ' + error.message + '</li>';
  }
}

/* ===== Initialize Metrics Animation ===== */
function initMetricsAnimation() {
  const cards = document.querySelectorAll('.metric-card.scroll-animate');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  cards.forEach(card => observer.observe(card));
}
