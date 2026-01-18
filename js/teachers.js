// Teachers Page - Admin Editing Functionality
import { db, doc, getDoc, setDoc, storage, ref, uploadBytes, getDownloadURL } from './shared/firebase-config.js';

// Default teachers data
const DEFAULT_TEACHERS = [
  {
    id: 'teacher1',
    name: '오순태',
    role: '대표',
    intro: '설익은 연기가 아닌, 현장에서 통하는 연기. 무대와 카메라를 모두 아는 실전 중심 연기 지도.',
    image: 'images/오순태.jpg',
    details: [
      { title: '이력', type: 'list', items: ['2008–2014|수액터스팜 원장', '2015–2022|쓰리에스 대표원장', '2023–2025|그룹 레슨'] },
      { title: '연극', type: 'text', content: '물수제비 잘하는 법 (제2회 R&J시어터 창작극 페스티벌 최우수 연기상), 헤다가블러, 속살, 하얀 역병, 고시원 등' },
      { title: '영화', type: 'text', content: '기묘한 가족, 상류사회, 인간중독, 이끼, 인사동 스캔들, 신기전, 해바라기 등' },
      { title: '드라마', type: 'text', content: '나쁜 엄마, 신성한 이혼, 힘쎈여자 도봉순, 실종느와르 M, 미세스 캅 등' }
    ]
  },
  {
    id: 'teacher2',
    name: '윤서완',
    role: '원장',
    intro: '연극 기반의 밀도 높은 연기와 방송·드라마 현장을 잇는 실전 트레이닝.',
    image: 'images/윤서완.jpg',
    details: [
      { title: '학력 · 경력', type: 'list', items: ['학력|국민대학교 연극과 졸업', '現|톤연기학원 신사캠프 전임강사'] },
      { title: '연극', type: 'text', content: '빅러브, 뻘, 매두사의 뗏목, 올모스트 메인, 댓글부대, 내 모든 걸, 의무계 등' },
      { title: '영화 · 방송', type: 'text', content: 'KAKA 장편영화 메이트, KBS 당찬우리동네, Olive 은주의방, SBS 국민사형투표, JTBC 힘쎈여자 강남순' }
    ]
  },
  {
    id: 'teacher3',
    name: '윤신웅',
    role: '연기파트 강사',
    intro: '드라마·영화·무대 경험 기반의 실전 연기 트레이닝.',
    image: 'images/윤신웅.jpg',
    details: [
      { title: '학력', type: 'text', content: '중앙대학교' },
      { title: '드라마', type: 'text', content: '취하는 로맨스, 백번의 추억, 미녀와 순정남, 모텔캘리포니아, 여왕의 집, 신입사원 강회장, 별들에게 물어봐' },
      { title: '영화', type: 'text', content: '데드맨, 민현은 괴로워, 육상의 전설, 목공소를 부탁해, 주차금지, 시체 옷 입히기' }
    ]
  },
  {
    id: 'teacher4',
    name: '윤영중',
    role: '뮤지컬파트 강사',
    intro: '성악 기반의 발성·호흡·무대 퍼포먼스를 통합하는 뮤지컬 트레이닝.',
    image: 'images/윤영중.jpg',
    details: [
      { title: '학력', type: 'text', content: '관동대학교 성악과 졸업, ITALIA Accademia di Donizetti 뮤지컬 과정 Diploma' },
      { title: '오페라', type: 'text', content: '라 트라비아타, 리골렛또, 나부코, 카르멘, 오텔로, 토스카, 라보엠, 춘향전, 투란도트 등' },
      { title: '주요 무대', type: 'text', content: '천지창조, 메시아, 베토벤 교향곡 9번, 조수미 독창회, 광복 60주년 기념 음악회, 조용필 40주년 콘서트 등 100여 회 이상 출연' }
    ]
  },
  {
    id: 'teacher5',
    name: '서현정',
    role: '무용파트 강사',
    intro: '기초부터 무대 실전까지 연결하는 테크닉·라인·몸의 언어 훈련.',
    image: 'images/서현정.jpg',
    details: [
      { title: '학력', type: 'list', items: ['2014|국민대학교 학사 졸업', '2017|국민대학교 무용학 석사 졸업'] },
      { title: '이력', type: 'list', items: ['전|충북예술고등학교 강사', '전|3S 무용 강사', '현|덕원예술고등학교 강사', '현|두아코댄스 컴퍼니 정단원'] }
    ]
  },
  {
    id: 'teacher6',
    name: '이정은',
    role: '연기파트 강사',
    intro: '창작/레퍼토리 기반의 텍스트 분석과 캐릭터 구축 트레이닝.',
    image: 'images/이정은.jpg',
    details: [
      { title: '학력', type: 'text', content: '한국예술종합학교 연극원' },
      { title: '연극', type: 'text', content: '2025 국립극단 청소년극 <19호실>, 아르코 봄작가 겨울무대 <회장님의 위인전>, 청소년 낭독극 다수' },
      { title: '영화/MV', type: 'text', content: '2025 <.> (채은석 감독), 2023 <식탁의 무게>, <손수>, 안다영 <걸작> MV' }
    ]
  },
  {
    id: 'teacher7',
    name: '이수연',
    role: '연기파트 강사',
    intro: '현장에 바로 적용되는 리얼리티·호흡·상황 연기 중심 트레이닝.',
    image: 'images/이수연.jpg',
    details: [
      { title: '학력', type: 'text', content: '중앙대학교 연극학과 졸업' },
      { title: '공연', type: 'text', content: '돐날, 12인, 로베르토 쥬코, 원자폭탄되기' },
      { title: '영화/드라마', type: 'text', content: '미로, 어느날, 자백의 대가, 내여자친구는 상남자, 미지의서울, 부테스' }
    ]
  },
  {
    id: 'teacher8',
    name: '김새하',
    role: '뮤지컬파트 강사',
    intro: '오디션·입시 실전에 강한 보컬/뮤지컬 퍼포먼스 트레이닝과 무대 경험 기반 코칭.',
    image: 'images/김새하.jpg',
    details: [
      { title: '강사 이력', type: 'text', content: 'EG씨어터 입시반 강사, 공감M아트센터 뮤지컬 강사, 3S연기학원 뮤지컬 강사, 로이액터스 뮤지컬 강사, 한국KPOP고등학교 연기강사' },
      { title: '주요 성과', type: 'text', content: 'SBS 판타스틱듀오 에일리·바이브 편 우승' },
      { title: '작품 이력', type: 'text', content: '뮤지컬 하모니, 길위의나라, the39, 그날우리는, 연극 정글, 뮤지컬 기적소리 등' }
    ]
  }
];

// Current teachers data
let currentTeachers = [];
let editingTeacherIndex = -1;

// Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// Render a single teacher card
function renderTeacherCard(teacher, index) {
  const isReverse = index % 2 === 1;

  let detailsHTML = '';
  if (teacher.details && teacher.details.length > 0) {
    teacher.details.forEach(detail => {
      if (detail.type === 'list' && detail.items) {
        const listItems = detail.items.map(item => {
          const [label, text] = item.split('|');
          return `<li><span>${escapeHTML(label)}</span> ${escapeHTML(text || '')}</li>`;
        }).join('');
        detailsHTML += `
          <div class="detail-block">
            <h3 class="detail-title">${escapeHTML(detail.title)}</h3>
            <ul class="detail-list">${listItems}</ul>
          </div>
        `;
      } else {
        detailsHTML += `
          <div class="detail-block">
            <h3 class="detail-title">${escapeHTML(detail.title)}</h3>
            <p class="detail-text">${escapeHTML(detail.content || '')}</p>
          </div>
        `;
      }
    });
  }

  return `
    <article class="teacher-card ${isReverse ? 'reverse' : ''} scroll-animate" data-index="${index}">
      <div class="teacher-image">
        <img src="${escapeHTML(teacher.image)}" alt="${escapeHTML(teacher.name)}" onerror="this.src='images/placeholder.jpg'">
        <div class="teacher-overlay">
          <span class="teacher-role-badge">${escapeHTML(teacher.role)}</span>
        </div>
        <button class="teacher-edit-btn" data-index="${index}" style="display:none;">편집</button>
        <button class="teacher-delete-btn" data-index="${index}" style="display:none;">삭제</button>
      </div>
      <div class="teacher-content">
        <div class="teacher-header">
          <span class="teacher-role">${escapeHTML(teacher.role)}</span>
          <h2 class="teacher-name">${escapeHTML(teacher.name)}</h2>
          <p class="teacher-intro">${escapeHTML(teacher.intro)}</p>
        </div>
        <div class="teacher-details">
          ${detailsHTML}
        </div>
      </div>
    </article>
  `;
}

// Render all teachers
function renderTeachers() {
  const container = document.getElementById('teachersList');
  if (!container) return;

  if (currentTeachers.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">등록된 강사가 없습니다.</p>';
    return;
  }

  container.innerHTML = currentTeachers.map((t, i) => renderTeacherCard(t, i)).join('');

  // Re-init scroll animations
  if (typeof initScrollAnimations === 'function') {
    initScrollAnimations();
  }

  // Update admin buttons visibility
  updateAdminButtonsVisibility();
}

// Update admin buttons visibility
function updateAdminButtonsVisibility() {
  const isAdmin = document.body.classList.contains('admin-mode');

  // Show/hide add teacher button
  const addBtn = document.getElementById('addTeacherBtn');
  if (addBtn) {
    addBtn.style.display = isAdmin ? 'inline-block' : 'none';
  }

  // Show/hide edit/delete buttons on each card
  document.querySelectorAll('.teacher-edit-btn, .teacher-delete-btn').forEach(btn => {
    btn.style.display = isAdmin ? 'block' : 'none';
  });
}

// Load teachers from Firebase
async function loadTeachers() {
  const container = document.getElementById('teachersList');
  if (!container) return;

  try {
    const docRef = doc(db, 'settings', 'teachers');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().list && docSnap.data().list.length > 0) {
      currentTeachers = docSnap.data().list;
    } else {
      // Use default data and save to Firebase
      currentTeachers = [...DEFAULT_TEACHERS];
      await setDoc(docRef, { list: currentTeachers });
    }

    renderTeachers();
  } catch (error) {
    console.error('Failed to load teachers:', error);
    // Fallback to default
    currentTeachers = [...DEFAULT_TEACHERS];
    renderTeachers();
  }
}

// Save teachers to Firebase
async function saveTeachers() {
  try {
    const docRef = doc(db, 'settings', 'teachers');
    await setDoc(docRef, { list: currentTeachers });
    return true;
  } catch (error) {
    console.error('Failed to save teachers:', error);
    alert('저장 실패: ' + error.message);
    return false;
  }
}

// Open edit modal
function openEditModal(index = -1) {
  editingTeacherIndex = index;
  const modal = document.getElementById('teacherEditModal');
  const form = document.getElementById('teacherEditForm');
  const title = document.getElementById('modalTitle');

  if (!modal || !form) return;

  if (index >= 0 && currentTeachers[index]) {
    // Edit existing
    title.textContent = '강사 정보 수정';
    const teacher = currentTeachers[index];
    document.getElementById('teacherName').value = teacher.name || '';
    document.getElementById('teacherRole').value = teacher.role || '';
    document.getElementById('teacherIntro').value = teacher.intro || '';
    document.getElementById('teacherImageUrl').value = teacher.image || '';

    // Details as JSON for simplicity
    const detailsText = teacher.details ? teacher.details.map(d => {
      if (d.type === 'list') {
        return `[${d.title}]\n${d.items.join('\n')}`;
      } else {
        return `[${d.title}]\n${d.content}`;
      }
    }).join('\n\n') : '';
    document.getElementById('teacherDetails').value = detailsText;
  } else {
    // Add new
    title.textContent = '새 강사 추가';
    form.reset();
    document.getElementById('teacherDetails').value = '[학력]\n내용\n\n[연극]\n내용';
  }

  modal.style.display = 'flex';
}

// Close edit modal
window.closeTeacherModal = function() {
  const modal = document.getElementById('teacherEditModal');
  if (modal) modal.style.display = 'none';
  editingTeacherIndex = -1;
};

// Parse details text to structured format
function parseDetails(text) {
  if (!text.trim()) return [];

  const details = [];
  const sections = text.split(/\n*\[/).filter(s => s.trim());

  sections.forEach(section => {
    const match = section.match(/^([^\]]+)\]\s*([\s\S]*)/);
    if (match) {
      const title = match[1].trim();
      const content = match[2].trim();
      const lines = content.split('\n').filter(l => l.trim());

      // Check if it's a list (lines contain '|' separator)
      const isList = lines.some(l => l.includes('|'));

      if (isList) {
        details.push({
          title,
          type: 'list',
          items: lines
        });
      } else {
        details.push({
          title,
          type: 'text',
          content: lines.join(', ')
        });
      }
    }
  });

  return details;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('teacherName').value.trim();
  const role = document.getElementById('teacherRole').value.trim();
  const intro = document.getElementById('teacherIntro').value.trim();
  let image = document.getElementById('teacherImageUrl').value.trim();
  const imageFile = document.getElementById('teacherImageFile').files[0];
  const detailsText = document.getElementById('teacherDetails').value;

  if (!name || !role) {
    alert('이름과 역할은 필수입니다.');
    return;
  }

  // Upload image if file selected
  if (imageFile) {
    try {
      const fileName = `teachers/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, imageFile);
      image = await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드 실패: ' + error.message);
      return;
    }
  }

  // Default image if none
  if (!image) {
    image = 'images/placeholder.jpg';
  }

  const teacherData = {
    id: editingTeacherIndex >= 0 ? currentTeachers[editingTeacherIndex].id : `teacher_${Date.now()}`,
    name,
    role,
    intro,
    image,
    details: parseDetails(detailsText)
  };

  if (editingTeacherIndex >= 0) {
    // Update existing
    currentTeachers[editingTeacherIndex] = teacherData;
  } else {
    // Add new
    currentTeachers.push(teacherData);
  }

  const success = await saveTeachers();
  if (success) {
    closeTeacherModal();
    renderTeachers();
  }
}

// Delete teacher
async function deleteTeacher(index) {
  if (!confirm(`"${currentTeachers[index].name}" 강사를 삭제하시겠습니까?`)) return;

  currentTeachers.splice(index, 1);
  const success = await saveTeachers();
  if (success) {
    renderTeachers();
  }
}

// Move teacher up/down (reorder)
async function moveTeacher(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= currentTeachers.length) return;

  [currentTeachers[index], currentTeachers[newIndex]] = [currentTeachers[newIndex], currentTeachers[index]];
  await saveTeachers();
  renderTeachers();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTeachers();

  // Form submission
  const form = document.getElementById('teacherEditForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Add teacher button
  const addBtn = document.getElementById('addTeacherBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openEditModal(-1));
  }

  // Event delegation for edit/delete buttons
  document.getElementById('teachersList')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.teacher-edit-btn');
    const deleteBtn = e.target.closest('.teacher-delete-btn');

    if (editBtn) {
      const index = parseInt(editBtn.dataset.index);
      openEditModal(index);
    }

    if (deleteBtn) {
      const index = parseInt(deleteBtn.dataset.index);
      deleteTeacher(index);
    }
  });

  // Watch for admin mode changes
  const observer = new MutationObserver(() => {
    updateAdminButtonsVisibility();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});
