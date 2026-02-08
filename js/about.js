// About Page - Firebase Integration
import { db, storage, doc, getDoc, setDoc, ref, uploadBytes, getDownloadURL } from '../shared/firebase-config.js';

const DEFAULT_FEATURES = [
  { title: '실전 중심 교육', text: '무대와 카메라 앞에서 바로 통하는 연기를 훈련합니다.' },
  { title: '개인 맞춤 코칭', text: '각자의 성향과 목표에 맞춘 1:1 피드백을 제공합니다.' },
  { title: '높은 합격률', text: '주요 대학 연극영화과 합격 실적을 자랑합니다.' },
  { title: '현장 경험 강사진', text: '드라마, 영화, 연극 현장 경험의 전문 강사진이 지도합니다.' }
];

const FEATURE_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>'
];

let aboutData = null;

function init() {
  loadAbout();
  initAboutAdmin();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function loadAbout() {
  try {
    const aboutRef = doc(db, 'settings', 'about');
    const snap = await getDoc(aboutRef);

    if (snap.exists()) {
      aboutData = snap.data();
    } else {
      aboutData = { features: [...DEFAULT_FEATURES] };
      await setDoc(aboutRef, { ...aboutData, updatedAt: new Date() });
    }

    // Update image
    const img = document.querySelector('.about-image img');
    if (img) {
      const url = aboutData.imageUrl || 'images/about.png';
      img.onload = () => { img.style.opacity = '1'; };
      img.src = url;
    }

    // Update features
    if (aboutData.features && aboutData.features.length > 0) {
      const cards = document.querySelectorAll('.feature-card');
      aboutData.features.forEach((feature, i) => {
        if (cards[i]) {
          const titleEl = cards[i].querySelector('.feature-title');
          const textEl = cards[i].querySelector('.feature-text');
          if (titleEl) titleEl.textContent = feature.title;
          if (textEl) textEl.textContent = feature.text;
        }
      });
    }
  } catch (error) {
    console.error('Failed to load about:', error);
  }
}

function initAboutAdmin() {
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    document.querySelectorAll('.about-admin-btn').forEach(btn => {
      btn.style.display = isAdmin ? 'inline-block' : 'none';
    });
  }

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });

  // Wait for admin mode bar
  setTimeout(checkAdminMode, 500);
}

// Edit about image
window.editAboutImage = async function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `about/about-image-${Date.now()}.${file.name.split('.').pop()}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      const aboutRef = doc(db, 'settings', 'about');
      const current = aboutData || { features: [...DEFAULT_FEATURES] };
      await setDoc(aboutRef, { ...current, imageUrl, updatedAt: new Date() });

      const img = document.querySelector('.about-image img');
      if (img) {
        img.style.opacity = '0';
        img.onload = () => { img.style.opacity = '1'; };
        img.src = imageUrl;
      }
      aboutData = { ...current, imageUrl };

      alert('이미지가 변경되었습니다.');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    }
  };
  input.click();
};

// Edit features
window.editFeatures = function() {
  const modal = document.getElementById('featuresEditModal');
  if (!modal) return;

  const features = aboutData?.features || DEFAULT_FEATURES;
  const container = document.getElementById('featuresInputs');
  container.innerHTML = '';

  features.forEach((f, i) => {
    container.innerHTML += `
      <div class="form-group" style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;margin-bottom:16px;">
        <label>카드 ${i + 1} 제목</label>
        <input type="text" class="feature-title-input" value="${escapeHTML(f.title)}">
        <label style="margin-top:8px;">카드 ${i + 1} 설명</label>
        <input type="text" class="feature-text-input" value="${escapeHTML(f.text)}">
      </div>
    `;
  });

  modal.style.display = 'flex';
};

window.saveFeaturesEdit = async function(e) {
  e.preventDefault();
  const form = document.getElementById('featuresEditForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    const titles = form.querySelectorAll('.feature-title-input');
    const texts = form.querySelectorAll('.feature-text-input');
    const features = [];

    for (let i = 0; i < titles.length; i++) {
      features.push({
        title: titles[i].value.trim(),
        text: texts[i].value.trim()
      });
    }

    const aboutRef = doc(db, 'settings', 'about');
    const current = aboutData || {};
    await setDoc(aboutRef, { ...current, features, updatedAt: new Date() });
    aboutData = { ...current, features };

    await loadAbout();
    closeFeaturesModal();
    alert('저장되었습니다.');
  } catch (error) {
    console.error('Failed to save features:', error);
    alert('저장에 실패했습니다: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '저장';
  }
};

window.closeFeaturesModal = function() {
  const modal = document.getElementById('featuresEditModal');
  if (modal) modal.style.display = 'none';
};

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}
