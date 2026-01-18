/* ===============================================
   뜸 연기학원 - Home Page JavaScript
   =============================================== */

// Firebase imports for hero video
import { db, storage, doc, getDoc, setDoc, ref, uploadBytes, getDownloadURL } from './shared/firebase-config.js';

// Google Sheets URLs
const SHEET_URLS = {
  metrics: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=2046441648&single=true&output=csv",
  names: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=0&single=true&output=csv",
  universities: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH5yGKWWaPSmqvWJJtbR2yNtVU4EaYoIyXReUWaWIllKPorVY1Q2AEfBYoN3JBYxDUq-vaN0Pwe973/pub?gid=1842660855&single=true&output=csv"
};

const COLS = 4;
const VISIBLE_ROWS = 5;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  loadHeroContent();
  loadStats();
  loadNames();
  loadUniversities();
  initHeroAdmin();
  initNamesAdmin();
  initUnivAdmin();
  initStatsAdmin();
});

// Load Hero Video and Text from Firebase
async function loadHeroContent() {
  try {
    const heroRef = doc(db, 'settings', 'hero');
    const heroSnap = await getDoc(heroRef);

    const video = document.getElementById('heroVideo');
    const titleEl = document.getElementById('heroTitle');
    const subtitleEl = document.getElementById('heroSubtitle');

    if (heroSnap.exists()) {
      const data = heroSnap.data();

      // Set video source
      if (data.videoUrl) {
        video.querySelector('source').src = data.videoUrl;
        video.load();
        video.play().catch(e => console.log('Video autoplay prevented'));
      }

      // Set text overlay
      if (titleEl) titleEl.textContent = data.title || '';
      if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
    } else {
      // Default content if no Firebase data
      if (titleEl) titleEl.textContent = '뜸 연기학원';
      if (subtitleEl) subtitleEl.textContent = '실전 중심 연기 교육으로 무대와 카메라 앞에서 통하는 연기를 만듭니다.';
    }
  } catch (error) {
    console.error('Failed to load hero content:', error);
  }
}

// Initialize Hero Admin Controls
function initHeroAdmin() {
  const editBtn = document.getElementById('heroEditBtn');
  const modal = document.getElementById('heroEditModal');
  const form = document.getElementById('heroEditForm');

  if (!editBtn || !modal || !form) return;

  // Check admin mode
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    editBtn.style.display = isAdmin ? 'block' : 'none';
  }

  // Initial check
  checkAdminMode();

  // Watch for admin mode changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        checkAdminMode();
      }
    });
  });
  observer.observe(document.body, { attributes: true });

  // Edit button click
  editBtn.addEventListener('click', async () => {
    // Load current values
    try {
      const heroRef = doc(db, 'settings', 'hero');
      const heroSnap = await getDoc(heroRef);

      if (heroSnap.exists()) {
        const data = heroSnap.data();
        document.getElementById('heroVideoUrl').value = data.videoUrl || '';
        document.getElementById('heroTitleInput').value = data.title || '';
        document.getElementById('heroSubtitleInput').value = data.subtitle || '';
      }
    } catch (e) {
      console.error('Failed to load hero data:', e);
    }

    modal.style.display = 'flex';
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      let videoUrl = document.getElementById('heroVideoUrl').value.trim();
      const videoFile = document.getElementById('heroVideoFile').files[0];
      const title = document.getElementById('heroTitleInput').value.trim();
      const subtitle = document.getElementById('heroSubtitleInput').value.trim();

      // Upload video file if selected
      if (videoFile) {
        const storageRef = ref(storage, `hero/hero-video-${Date.now()}.mp4`);
        await uploadBytes(storageRef, videoFile);
        videoUrl = await getDownloadURL(storageRef);
      }

      // Save to Firebase
      const heroRef = doc(db, 'settings', 'hero');
      await setDoc(heroRef, {
        videoUrl: videoUrl,
        title: title,
        subtitle: subtitle,
        updatedAt: new Date()
      });

      // Refresh hero content
      await loadHeroContent();

      closeHeroModal();
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save hero content:', error);
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  });
}

// Close hero modal
window.closeHeroModal = function() {
  const modal = document.getElementById('heroEditModal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('heroVideoFile').value = '';
  }
};

// Check if header row
function isHeaderRow(label, value) {
  const s = (String(label || '') + ' ' + String(value || '')).toLowerCase();
  return s.includes('label') || s.includes('value') || s.includes('항목') || s.includes('값');
}

function isUnivHeader(cell) {
  const s = String(cell || '').trim().toLowerCase();
  return s === '대학' || s === '대학명' || s === 'university';
}

// Load Stats - Try Firebase first, then Google Sheets
async function loadStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  try {
    // Try Firebase first
    const statsRef = doc(db, 'settings', 'stats');
    const statsSnap = await getDoc(statsRef);

    let stats = [];

    if (statsSnap.exists() && statsSnap.data().items && statsSnap.data().items.length > 0) {
      stats = statsSnap.data().items;
    } else {
      // Fallback to Google Sheets
      const res = await fetch(SHEET_URLS.metrics, { cache: 'no-store' });
      const csv = await res.text();
      let rows = parseCSV(csv);

      rows = rows.map(r => [(r[0] || '').trim(), (r[1] || '').trim()]).filter(r => r[0] || r[1]);

      if (rows.length && isHeaderRow(rows[0][0], rows[0][1])) {
        rows = rows.slice(1);
      }

      stats = rows.slice(0, 4).map(([label, value]) => ({ label, value }));
    }

    // Store for editing
    window.currentStats = [...stats];

    grid.innerHTML = '';

    stats.forEach(({ label, value }) => {
      if (!label && !value) return;

      const card = document.createElement('div');
      card.className = 'stat-card scroll-animate';
      card.innerHTML = `
        <div class="stat-value">${escapeHTML(value)}</div>
        <div class="stat-label">${escapeHTML(label)}</div>
      `;
      grid.appendChild(card);
    });

    initScrollAnimations();
  } catch (error) {
    console.error('Failed to load stats:', error);
    grid.innerHTML = '<div class="loading">데이터 로딩 실패</div>';
  }
}

// Load Rolling Names - Try Firebase first, then Google Sheets
async function loadNames() {
  const ul = document.getElementById('nameGrid');
  if (!ul) return;

  try {
    // Try Firebase first
    const namesRef = doc(db, 'settings', 'names');
    const namesSnap = await getDoc(namesRef);

    let names = [];

    if (namesSnap.exists() && namesSnap.data().list && namesSnap.data().list.length > 0) {
      names = namesSnap.data().list;
    } else {
      // Fallback to Google Sheets
      const res = await fetch(SHEET_URLS.names, { cache: 'no-store' });
      const csv = await res.text();

      const lines = csv.trim().split('\n').map(l => l.replace(/"/g, '').trim());
      const colA = lines.map(l => (l.split(',')[0] || '').trim());

      names = colA.filter((v, idx) => v && idx !== 0);
    }

    if (names.length === 0) {
      ul.innerHTML = '<li>데이터가 없습니다.</li>';
      return;
    }

    // Store original names for editing
    window.currentNames = [...names];

    // Align to columns
    const rem = names.length % COLS;
    if (rem !== 0) {
      for (let i = 0; i < COLS - rem; i++) names.push('');
    }

    // Minimum length
    const minNeeded = (VISIBLE_ROWS + 5) * COLS;
    while (names.length < minNeeded) {
      names = names.concat(names);
    }

    const doubled = names.concat(names);

    ul.innerHTML = '';
    doubled.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n;
      ul.appendChild(li);
    });

    // Calculate shift
    requestAnimationFrame(() => {
      const half = ul.scrollHeight / 2;
      ul.style.setProperty('--shift', `-${half}px`);
    });
  } catch (error) {
    console.error('Failed to load names:', error);
  }
}

// Load Universities - Try Firebase first, then Google Sheets
async function loadUniversities() {
  const ul = document.getElementById('univGrid');
  if (!ul) return;

  try {
    // Try Firebase first
    const univRef = doc(db, 'settings', 'universities');
    const univSnap = await getDoc(univRef);

    let items = [];

    if (univSnap.exists() && univSnap.data().list && univSnap.data().list.length > 0) {
      items = univSnap.data().list;
    } else {
      // Fallback to Google Sheets
      const res = await fetch(SHEET_URLS.universities, { cache: 'no-store' });
      const csv = await res.text();
      const rows = parseCSV(csv);

      items = rows.map(r => (r[0] || '').trim()).filter(Boolean);

      if (items.length && isUnivHeader(items[0])) {
        items = items.slice(1);
      }
    }

    // Store original items for editing
    window.currentUniversities = [...items];

    ul.innerHTML = '';

    items.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load universities:', error);
  }
}

// Resize handler
window.addEventListener('resize', () => {
  const ul = document.getElementById('nameGrid');
  if (!ul || !ul.children.length) return;

  requestAnimationFrame(() => {
    const half = ul.scrollHeight / 2;
    ul.style.setProperty('--shift', `-${half}px`);
  });
});

// ========== Names Admin Functions ==========
function initNamesAdmin() {
  const editBtn = document.getElementById('editNamesBtn');
  const modal = document.getElementById('namesEditModal');
  const form = document.getElementById('namesEditForm');

  if (!editBtn || !modal || !form) return;

  // Check admin mode
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    editBtn.style.display = isAdmin ? 'inline-block' : 'none';
  }

  checkAdminMode();

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });

  // Edit button click
  editBtn.addEventListener('click', async () => {
    const textarea = document.getElementById('namesTextarea');
    if (window.currentNames && window.currentNames.length > 0) {
      textarea.value = window.currentNames.join('\n');
    } else {
      // Try to load from Firebase
      try {
        const namesRef = doc(db, 'settings', 'names');
        const namesSnap = await getDoc(namesRef);
        if (namesSnap.exists() && namesSnap.data().list) {
          textarea.value = namesSnap.data().list.join('\n');
        }
      } catch (e) {
        console.error('Failed to load names:', e);
      }
    }
    modal.style.display = 'flex';
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      const textarea = document.getElementById('namesTextarea');
      const names = textarea.value.split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      // Save to Firebase
      const namesRef = doc(db, 'settings', 'names');
      await setDoc(namesRef, {
        list: names,
        updatedAt: new Date()
      });

      // Refresh display
      await loadNames();

      closeNamesModal();
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save names:', error);
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  });
}

// Close names modal
window.closeNamesModal = function() {
  const modal = document.getElementById('namesEditModal');
  if (modal) modal.style.display = 'none';
};

// ========== Universities Admin Functions ==========
function initUnivAdmin() {
  const editBtn = document.getElementById('editUnivBtn');
  const modal = document.getElementById('univEditModal');
  const form = document.getElementById('univEditForm');

  if (!editBtn || !modal || !form) return;

  // Check admin mode
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    editBtn.style.display = isAdmin ? 'inline-block' : 'none';
  }

  checkAdminMode();

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });

  // Edit button click
  editBtn.addEventListener('click', async () => {
    const textarea = document.getElementById('univTextarea');
    if (window.currentUniversities && window.currentUniversities.length > 0) {
      textarea.value = window.currentUniversities.join('\n');
    } else {
      // Try to load from Firebase
      try {
        const univRef = doc(db, 'settings', 'universities');
        const univSnap = await getDoc(univRef);
        if (univSnap.exists() && univSnap.data().list) {
          textarea.value = univSnap.data().list.join('\n');
        }
      } catch (e) {
        console.error('Failed to load universities:', e);
      }
    }
    modal.style.display = 'flex';
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      const textarea = document.getElementById('univTextarea');
      const universities = textarea.value.split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      // Save to Firebase
      const univRef = doc(db, 'settings', 'universities');
      await setDoc(univRef, {
        list: universities,
        updatedAt: new Date()
      });

      // Refresh display
      await loadUniversities();

      closeUnivModal();
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save universities:', error);
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  });
}

// Close univ modal
window.closeUnivModal = function() {
  const modal = document.getElementById('univEditModal');
  if (modal) modal.style.display = 'none';
};

// ========== Stats Admin Functions ==========
function initStatsAdmin() {
  const editBtn = document.getElementById('editStatsBtn');
  const modal = document.getElementById('statsEditModal');
  const form = document.getElementById('statsEditForm');
  const inputsContainer = document.getElementById('statsInputs');

  if (!editBtn || !modal || !form || !inputsContainer) return;

  // Check admin mode
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    editBtn.style.display = isAdmin ? 'inline-block' : 'none';
  }

  checkAdminMode();

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });

  // Generate input fields
  function generateInputs(stats) {
    inputsContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const stat = stats[i] || { label: '', value: '' };
      inputsContainer.innerHTML += `
        <div class="form-group" style="display:flex;gap:12px;margin-bottom:16px;">
          <div style="flex:1;">
            <label>항목 ${i + 1} 라벨</label>
            <input type="text" class="stat-label-input" placeholder="예: 입시합격률" value="${escapeHTML(stat.label || '')}">
          </div>
          <div style="flex:1;">
            <label>값</label>
            <input type="text" class="stat-value-input" placeholder="예: 95%" value="${escapeHTML(stat.value || '')}">
          </div>
        </div>
      `;
    }
  }

  // Edit button click
  editBtn.addEventListener('click', async () => {
    if (window.currentStats && window.currentStats.length > 0) {
      generateInputs(window.currentStats);
    } else {
      // Try to load from Firebase
      try {
        const statsRef = doc(db, 'settings', 'stats');
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists() && statsSnap.data().items) {
          generateInputs(statsSnap.data().items);
        } else {
          generateInputs([]);
        }
      } catch (e) {
        console.error('Failed to load stats:', e);
        generateInputs([]);
      }
    }
    modal.style.display = 'flex';
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
      const labelInputs = form.querySelectorAll('.stat-label-input');
      const valueInputs = form.querySelectorAll('.stat-value-input');
      const items = [];

      for (let i = 0; i < labelInputs.length; i++) {
        const label = labelInputs[i].value.trim();
        const value = valueInputs[i].value.trim();
        if (label || value) {
          items.push({ label, value });
        }
      }

      // Save to Firebase
      const statsRef = doc(db, 'settings', 'stats');
      await setDoc(statsRef, {
        items: items,
        updatedAt: new Date()
      });

      // Refresh display
      await loadStats();

      closeStatsModal();
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save stats:', error);
      alert('저장에 실패했습니다: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  });
}

// Close stats modal
window.closeStatsModal = function() {
  const modal = document.getElementById('statsEditModal');
  if (modal) modal.style.display = 'none';
};
