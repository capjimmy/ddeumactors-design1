// Contact Page - Admin Edit for contact info
import { db, doc, getDoc, setDoc } from '../shared/firebase-config.js';

const DEFAULT_CONTACT = {
  title: '지금 상담을 신청하세요',
  description: '레벨 테스트 후 맞춤 커리큘럼을 안내해 드립니다.',
  address: '서울특별시 동작구 동작대로 71 3층',
  phone: '02-525-0701',
  hours: '평일 11:00 - 22:00'
};

function init() {
  loadContactInfo();
  initContactAdmin();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function loadContactInfo() {
  try {
    const contactRef = doc(db, 'settings', 'contact');
    const snap = await getDoc(contactRef);

    let data;
    if (snap.exists()) {
      data = snap.data();
    } else {
      data = { ...DEFAULT_CONTACT };
      await setDoc(contactRef, { ...data, updatedAt: new Date() });
    }

    // Update contact page elements
    const titleEl = document.querySelector('.contact-info-title');
    const descEl = document.querySelector('.contact-info-desc');
    if (titleEl) titleEl.textContent = data.title || DEFAULT_CONTACT.title;
    if (descEl) descEl.textContent = data.description || DEFAULT_CONTACT.description;

    // Update contact cards
    const cards = document.querySelectorAll('.contact-card-content p');
    if (cards[0]) cards[0].textContent = data.address || DEFAULT_CONTACT.address;
    if (cards[1]) cards[1].textContent = data.phone || DEFAULT_CONTACT.phone;
    if (cards[2]) cards[2].textContent = data.hours || DEFAULT_CONTACT.hours;

    // Update footer info on this page
    const footerAddress = document.querySelector('.footer-info p:last-child');
    const footerPhone = document.querySelector('.footer-phone');
    const footerHours = document.querySelector('.footer-hours');
    if (footerAddress) footerAddress.textContent = data.address || DEFAULT_CONTACT.address;
    if (footerPhone) footerPhone.textContent = data.phone || DEFAULT_CONTACT.phone;
    if (footerHours) footerHours.textContent = data.hours || DEFAULT_CONTACT.hours;

  } catch (error) {
    console.error('Failed to load contact info:', error);
  }
}

function initContactAdmin() {
  function checkAdminMode() {
    const isAdmin = document.body.classList.contains('admin-mode');
    document.querySelectorAll('.contact-admin-btn').forEach(btn => {
      btn.style.display = isAdmin ? 'inline-block' : 'none';
    });
  }

  const observer = new MutationObserver(() => checkAdminMode());
  observer.observe(document.body, { attributes: true });
  setTimeout(checkAdminMode, 500);
}

window.editContactInfo = async function() {
  const modal = document.getElementById('contactEditModal');
  if (!modal) return;

  try {
    const contactRef = doc(db, 'settings', 'contact');
    const snap = await getDoc(contactRef);
    const data = snap.exists() ? snap.data() : DEFAULT_CONTACT;

    document.getElementById('contactTitle').value = data.title || '';
    document.getElementById('contactDesc').value = data.description || '';
    document.getElementById('contactAddress').value = data.address || '';
    document.getElementById('contactPhone').value = data.phone || '';
    document.getElementById('contactHours').value = data.hours || '';
  } catch (e) {
    console.error('Failed to load contact data:', e);
  }

  modal.style.display = 'flex';
};

window.saveContactEdit = async function(e) {
  e.preventDefault();
  const form = document.getElementById('contactEditForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    const data = {
      title: document.getElementById('contactTitle').value.trim(),
      description: document.getElementById('contactDesc').value.trim(),
      address: document.getElementById('contactAddress').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      hours: document.getElementById('contactHours').value.trim(),
      updatedAt: new Date()
    };

    const contactRef = doc(db, 'settings', 'contact');
    await setDoc(contactRef, data);

    await loadContactInfo();
    closeContactEditModal();
    alert('저장되었습니다.');
  } catch (error) {
    console.error('Failed to save contact info:', error);
    alert('저장에 실패했습니다: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '저장';
  }
};

window.closeContactEditModal = function() {
  const modal = document.getElementById('contactEditModal');
  if (modal) modal.style.display = 'none';
};
