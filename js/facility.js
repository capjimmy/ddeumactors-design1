// Facility Page - Firebase Integration
// =====================================

import {
  db,
  storage,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from '../shared/firebase-config.js';

const COLLECTION_NAME = 'facilities';
let facilities = [];
let draggedItem = null;

// Initialize facility page
async function initFacilityPage() {
  await loadFacilities();
  renderFacilities();

  if (window.isAdminLoggedIn && window.isAdminLoggedIn()) {
    setupAdminUI();
  }
}

// Load facilities from Firebase
async function loadFacilities() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    facilities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Failed to load facilities:', error);
    facilities = [];
  }
}

// Render facilities grid
function renderFacilities() {
  const grid = document.getElementById('facilityGrid');
  if (!grid) return;

  const isAdmin = window.isAdminLoggedIn && window.isAdminLoggedIn();

  if (facilities.length === 0) {
    grid.innerHTML = '<p class="no-data">등록된 시설 사진이 없습니다.</p>';
    return;
  }

  grid.innerHTML = facilities.map((facility, index) => `
    <div class="facility-card scroll-animate ${isAdmin ? 'admin-mode' : ''}"
         data-id="${facility.id}"
         data-index="${index}"
         ${isAdmin ? 'draggable="true"' : ''}>
      <img src="${escapeHTML(facility.imageUrl)}" alt="${escapeHTML(facility.title)}" loading="lazy">
      <div class="facility-card-overlay">
        <span class="facility-card-title">${escapeHTML(facility.title)}</span>
      </div>
      ${isAdmin ? `
        <div class="facility-admin-controls">
          <button class="admin-btn edit-btn" onclick="editFacility('${facility.id}')" title="수정">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="admin-btn delete-btn" onclick="deleteFacility('${facility.id}')" title="삭제">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <div class="drag-handle" title="드래그하여 순서 변경">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');

  // Re-init scroll animations
  if (window.initScrollAnimations) {
    window.initScrollAnimations();
  }

  if (isAdmin) {
    setupDragAndDrop();
  }
}

// Setup admin UI
function setupAdminUI() {
  const section = document.querySelector('.facility-section .container');
  if (!section) return;

  // Add admin toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'facility-admin-toolbar';
  toolbar.innerHTML = `
    <button class="btn-add-facility" onclick="openAddModal()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      시설 사진 추가
    </button>
  `;
  section.insertBefore(toolbar, section.firstChild);

  // Add modal
  const modal = document.createElement('div');
  modal.id = 'facilityModal';
  modal.className = 'facility-modal';
  modal.innerHTML = `
    <div class="facility-modal-overlay" onclick="closeModal()"></div>
    <div class="facility-modal-content">
      <h2 id="modalTitle">시설 사진 추가</h2>
      <form id="facilityForm" onsubmit="saveFacility(event)">
        <input type="hidden" id="facilityId">
        <div class="form-group">
          <label for="facilityTitle">제목</label>
          <input type="text" id="facilityTitle" required placeholder="예: 연습실 1">
        </div>
        <div class="form-group">
          <label for="facilityImage">사진</label>
          <div class="image-upload-area" id="imageUploadArea">
            <input type="file" id="facilityImage" accept="image/*" onchange="previewImage(event)">
            <div class="upload-placeholder" id="uploadPlaceholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>클릭하여 이미지 선택</span>
            </div>
            <img id="imagePreview" style="display:none;">
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="closeModal()">취소</button>
          <button type="submit" class="btn-save" id="saveBtn">저장</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

// Open add modal
function openAddModal() {
  document.getElementById('modalTitle').textContent = '시설 사진 추가';
  document.getElementById('facilityId').value = '';
  document.getElementById('facilityTitle').value = '';
  document.getElementById('facilityImage').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('facilityImage').required = true;
  document.getElementById('facilityModal').classList.add('active');
}

// Open edit modal
async function editFacility(id) {
  const facility = facilities.find(f => f.id === id);
  if (!facility) return;

  document.getElementById('modalTitle').textContent = '시설 사진 수정';
  document.getElementById('facilityId').value = id;
  document.getElementById('facilityTitle').value = facility.title;
  document.getElementById('facilityImage').value = '';
  document.getElementById('facilityImage').required = false;

  const preview = document.getElementById('imagePreview');
  preview.src = facility.imageUrl;
  preview.style.display = 'block';
  document.getElementById('uploadPlaceholder').style.display = 'none';

  document.getElementById('facilityModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('facilityModal').classList.remove('active');
}

// Preview image
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('imagePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Save facility
async function saveFacility(event) {
  event.preventDefault();

  const id = document.getElementById('facilityId').value;
  const title = document.getElementById('facilityTitle').value.trim();
  const imageFile = document.getElementById('facilityImage').files[0];
  const saveBtn = document.getElementById('saveBtn');

  if (!title) {
    alert('제목을 입력해주세요.');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = '저장 중...';

  try {
    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      const fileName = `facilities/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    if (id) {
      // Update existing
      const updateData = { title, updatedAt: serverTimestamp() };
      if (imageUrl) {
        // Delete old image
        const oldFacility = facilities.find(f => f.id === id);
        if (oldFacility && oldFacility.storagePath) {
          try {
            await deleteObject(ref(storage, oldFacility.storagePath));
          } catch (e) {}
        }
        updateData.imageUrl = imageUrl;
        updateData.storagePath = `facilities/${Date.now()}_${imageFile.name}`;
      }
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } else {
      // Add new
      if (!imageUrl) {
        alert('이미지를 선택해주세요.');
        saveBtn.disabled = false;
        saveBtn.textContent = '저장';
        return;
      }
      await addDoc(collection(db, COLLECTION_NAME), {
        title,
        imageUrl,
        storagePath: `facilities/${Date.now()}_${imageFile.name}`,
        order: facilities.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    closeModal();
    await loadFacilities();
    renderFacilities();

  } catch (error) {
    console.error('Save failed:', error);
    alert('저장에 실패했습니다: ' + error.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '저장';
  }
}

// Delete facility
async function deleteFacility(id) {
  if (!confirm('이 시설 사진을 삭제하시겠습니까?')) return;

  try {
    const facility = facilities.find(f => f.id === id);

    // Delete image from storage
    if (facility && facility.storagePath) {
      try {
        await deleteObject(ref(storage, facility.storagePath));
      } catch (e) {}
    }

    // Delete document
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    await loadFacilities();
    renderFacilities();

  } catch (error) {
    console.error('Delete failed:', error);
    alert('삭제에 실패했습니다: ' + error.message);
  }
}

// Setup drag and drop for reordering
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.facility-card.admin-mode');

  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
  });
}

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.facility-card').forEach(card => {
    card.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  if (this === draggedItem) return;

  const fromIndex = parseInt(draggedItem.dataset.index);
  const toIndex = parseInt(this.dataset.index);

  // Reorder in array
  const [moved] = facilities.splice(fromIndex, 1);
  facilities.splice(toIndex, 0, moved);

  // Update order in Firebase
  try {
    const batch = [];
    facilities.forEach((facility, index) => {
      batch.push(updateDoc(doc(db, COLLECTION_NAME, facility.id), { order: index }));
    });
    await Promise.all(batch);
    renderFacilities();
  } catch (error) {
    console.error('Reorder failed:', error);
    alert('순서 변경에 실패했습니다.');
    await loadFacilities();
    renderFacilities();
  }
}

// Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export functions to window for onclick handlers
window.openAddModal = openAddModal;
window.editFacility = editFacility;
window.deleteFacility = deleteFacility;
window.closeModal = closeModal;
window.previewImage = previewImage;
window.saveFacility = saveFacility;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFacilityPage);
} else {
  initFacilityPage();
}
