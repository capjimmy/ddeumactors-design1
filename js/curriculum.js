// Curriculum Page - Firebase Integration
import { db, doc, getDoc, setDoc } from '../shared/firebase-config.js';

const DEFAULT_COURSES = [
  {
    badge: '입시반',
    badgeStyle: '',
    title: '입시반 고등',
    subtitle: '재입 포함',
    schedule: '주 6회',
    hours: '72시간',
    price: '95만원',
    points: [
      '대학별 실기 유형 분석 및 전략 수립',
      '자유·지정·즉흥·상황 연기 완성',
      '개인 캐릭터·톤 확립 & 실전 안정감 강화'
    ]
  },
  {
    badge: '예비입시반',
    badgeStyle: 'background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.3);color:#22d3ee;',
    title: '예비입시반',
    subtitle: '고2 이하',
    schedule: '주 4회',
    hours: '32시간',
    price: '50만원',
    points: [
      '호흡·발성·발음·집중·상상력 기초 확립',
      '장면 분석(상황·목표·행동) 습관화',
      '리듬감·신체 표현 기반 강화'
    ]
  },
  {
    badge: '주말반',
    badgeStyle: 'background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.3);color:#22d3ee;',
    title: '주말 입시반',
    subtitle: 'CLASS 3시간 · 정원 8명',
    schedule: '주 4회',
    hours: '48시간',
    price: '75만원',
    points: [
      '주말 집중 루틴으로 실기 핵심 역량 빠른 상승',
      '독백·지정·제시·즉흥·구술 대학별 대응 강화',
      '주특기/부특기 기초 → 개인 작품 완성'
    ]
  }
];

const DEFAULT_GUIDANCE = [
  { label: '상담/레벨', text: '레벨 테스트 후 반 편성 · 목표 대학/성향 기반 추천' },
  { label: '점검', text: '월간 점검(옵션) · 모의 실기/면접(필요 시)' },
  { label: '유의', text: '커리큘럼은 시즌/입시 트렌드에 따라 일부 조정될 수 있습니다' }
];

let curriculumData = null;

document.addEventListener('DOMContentLoaded', function() {
  loadCurriculum();
  initCurriculumAdmin();
});

async function loadCurriculum() {
  try {
    const currRef = doc(db, 'settings', 'curriculum');
    const snap = await getDoc(currRef);

    if (snap.exists()) {
      curriculumData = snap.data();
    } else {
      curriculumData = { courses: [...DEFAULT_COURSES], guidance: [...DEFAULT_GUIDANCE] };
      await setDoc(currRef, { ...curriculumData, updatedAt: new Date() });
    }

    renderCourses();
    renderGuidance();
  } catch (error) {
    console.error('Failed to load curriculum:', error);
  }
}

function renderCourses() {
  const container = document.getElementById('curriculumCards');
  if (!container || !curriculumData?.courses) return;

  const isAdmin = document.body.classList.contains('admin-mode');

  container.innerHTML = curriculumData.courses.map((course, i) => `
    <article class="curriculum-card scroll-animate">
      ${isAdmin ? `<button class="admin-edit-section-btn" style="position:absolute;top:12px;right:12px;z-index:2;" onclick="editCourse(${i})">편집</button>` : ''}
      <span class="curriculum-badge" ${course.badgeStyle ? `style="${escapeHTML(course.badgeStyle)}"` : ''}>${escapeHTML(course.badge)}</span>
      <h3 class="curriculum-card-title">${escapeHTML(course.title)}</h3>
      <p class="curriculum-card-sub">${escapeHTML(course.subtitle)}</p>
      <div class="curriculum-meta">
        <div class="curriculum-meta-item">
          <div class="label">수업</div>
          <div class="value">${escapeHTML(course.schedule)}</div>
        </div>
        <div class="curriculum-meta-item">
          <div class="label">총 시간</div>
          <div class="value">${escapeHTML(course.hours)}</div>
        </div>
        <div class="curriculum-meta-item price">
          <div class="label">수강료</div>
          <div class="value">${escapeHTML(course.price)}</div>
        </div>
      </div>
      <div class="curriculum-points">
        <div class="curriculum-points-title">핵심 포인트</div>
        <ul class="curriculum-points-list">
          ${course.points.map(p => `<li>${escapeHTML(p)}</li>`).join('')}
        </ul>
      </div>
    </article>
  `).join('');

  // Re-init scroll animations
  initScrollAnimations();
}

function renderGuidance() {
  const container = document.getElementById('guidanceContent');
  if (!container || !curriculumData?.guidance) return;

  container.innerHTML = curriculumData.guidance.map(item => `
    <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:16px;">
      <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:8px;">${escapeHTML(item.label)}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.85);">${escapeHTML(item.text)}</div>
    </div>
  `).join('');
}

function initCurriculumAdmin() {
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    document.querySelectorAll('.curriculum-admin-btn').forEach(btn => {
      btn.style.display = isAdmin ? 'inline-block' : 'none';
    });
    // Re-render to show/hide edit buttons on cards
    if (curriculumData) renderCourses();
  }

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });
  setTimeout(checkAdminMode, 500);
}

// Edit single course
window.editCourse = function(index) {
  const course = curriculumData.courses[index];
  if (!course) return;

  const modal = document.getElementById('courseEditModal');
  document.getElementById('courseIndex').value = index;
  document.getElementById('courseBadge').value = course.badge;
  document.getElementById('courseBadgeStyle').value = course.badgeStyle || '';
  document.getElementById('courseTitle').value = course.title;
  document.getElementById('courseSubtitle').value = course.subtitle;
  document.getElementById('courseSchedule').value = course.schedule;
  document.getElementById('courseHours').value = course.hours;
  document.getElementById('coursePrice').value = course.price;
  document.getElementById('coursePoints').value = course.points.join('\n');

  modal.style.display = 'flex';
};

window.saveCourseEdit = async function(e) {
  e.preventDefault();
  const form = document.getElementById('courseEditForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    const index = parseInt(document.getElementById('courseIndex').value);
    const updatedCourse = {
      badge: document.getElementById('courseBadge').value.trim(),
      badgeStyle: document.getElementById('courseBadgeStyle').value.trim(),
      title: document.getElementById('courseTitle').value.trim(),
      subtitle: document.getElementById('courseSubtitle').value.trim(),
      schedule: document.getElementById('courseSchedule').value.trim(),
      hours: document.getElementById('courseHours').value.trim(),
      price: document.getElementById('coursePrice').value.trim(),
      points: document.getElementById('coursePoints').value.split('\n').map(p => p.trim()).filter(p => p)
    };

    curriculumData.courses[index] = updatedCourse;

    const currRef = doc(db, 'settings', 'curriculum');
    await setDoc(currRef, { ...curriculumData, updatedAt: new Date() });

    renderCourses();
    closeCourseModal();
    alert('저장되었습니다.');
  } catch (error) {
    console.error('Failed to save course:', error);
    alert('저장에 실패했습니다: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '저장';
  }
};

window.closeCourseModal = function() {
  const modal = document.getElementById('courseEditModal');
  if (modal) modal.style.display = 'none';
};

// Edit guidance
window.editGuidance = function() {
  const modal = document.getElementById('guidanceEditModal');
  const container = document.getElementById('guidanceInputs');
  const guidance = curriculumData?.guidance || DEFAULT_GUIDANCE;

  container.innerHTML = guidance.map((item, i) => `
    <div class="form-group" style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="flex:0.3;">
        <label>라벨 ${i + 1}</label>
        <input type="text" class="guidance-label-input" value="${escapeHTML(item.label)}">
      </div>
      <div style="flex:0.7;">
        <label>내용</label>
        <input type="text" class="guidance-text-input" value="${escapeHTML(item.text)}">
      </div>
    </div>
  `).join('');

  modal.style.display = 'flex';
};

window.saveGuidanceEdit = async function(e) {
  e.preventDefault();
  const form = document.getElementById('guidanceEditForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    const labels = form.querySelectorAll('.guidance-label-input');
    const texts = form.querySelectorAll('.guidance-text-input');
    const guidance = [];

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i].value.trim();
      const text = texts[i].value.trim();
      if (label || text) guidance.push({ label, text });
    }

    curriculumData.guidance = guidance;
    const currRef = doc(db, 'settings', 'curriculum');
    await setDoc(currRef, { ...curriculumData, updatedAt: new Date() });

    renderGuidance();
    closeGuidanceModal();
    alert('저장되었습니다.');
  } catch (error) {
    console.error('Failed to save guidance:', error);
    alert('저장에 실패했습니다: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '저장';
  }
};

window.closeGuidanceModal = function() {
  const modal = document.getElementById('guidanceEditModal');
  if (modal) modal.style.display = 'none';
};

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}
