// Admin Authentication System
// ===========================
// Simple password-based admin authentication

const ADMIN_CREDENTIALS = {
  username: 'ddeumadmin',
  password: 'Ddeum@2026!'
};

const ADMIN_SESSION_KEY = 'ddeum_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Check if admin is logged in
function isAdminLoggedIn() {
  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return false;

  try {
    const data = JSON.parse(session);
    if (Date.now() > data.expiry) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Admin login
function adminLogin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const session = {
      loggedIn: true,
      expiry: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

// Admin logout
function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.reload();
}

// Show login modal
function showLoginModal() {
  const modal = document.createElement('div');
  modal.className = 'admin-login-modal';
  modal.innerHTML = `
    <div class="admin-login-overlay"></div>
    <div class="admin-login-box">
      <h2>관리자 로그인</h2>
      <form id="adminLoginForm">
        <div class="form-group">
          <label for="adminUsername">아이디</label>
          <input type="text" id="adminUsername" required autocomplete="username">
        </div>
        <div class="form-group">
          <label for="adminPassword">비밀번호</label>
          <input type="password" id="adminPassword" required autocomplete="current-password">
        </div>
        <p id="loginError" class="error-msg" style="display:none;">아이디 또는 비밀번호가 잘못되었습니다.</p>
        <button type="submit" class="btn-login">로그인</button>
        <button type="button" class="btn-cancel" onclick="closeLoginModal()">취소</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (adminLogin(username, password)) {
      closeLoginModal();
      window.location.reload();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  });
}

// Close login modal
function closeLoginModal() {
  const modal = document.querySelector('.admin-login-modal');
  if (modal) modal.remove();
}

// Add admin login modal styles
function addAdminStyles() {
  if (document.getElementById('admin-auth-styles')) return;

  const style = document.createElement('style');
  style.id = 'admin-auth-styles';
  style.textContent = `
    .admin-login-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .admin-login-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
    }
    .admin-login-box {
      position: relative;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .admin-login-box h2 {
      margin: 0 0 24px;
      color: #d4af37;
      font-size: 24px;
      text-align: center;
    }
    .admin-login-box .form-group {
      margin-bottom: 16px;
    }
    .admin-login-box label {
      display: block;
      margin-bottom: 6px;
      color: #999;
      font-size: 14px;
    }
    .admin-login-box input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #0d0d0d;
      color: #fff;
      font-size: 15px;
      box-sizing: border-box;
    }
    .admin-login-box input:focus {
      outline: none;
      border-color: #d4af37;
    }
    .admin-login-box .error-msg {
      color: #ff4757;
      font-size: 13px;
      margin: 12px 0;
      text-align: center;
    }
    .admin-login-box .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #d4af37, #b8960c);
      border: none;
      border-radius: 8px;
      color: #000;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .admin-login-box .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212,175,55,0.3);
    }
    .admin-login-box .btn-cancel {
      width: 100%;
      padding: 12px;
      background: transparent;
      border: 1px solid #444;
      border-radius: 8px;
      color: #888;
      font-size: 14px;
      cursor: pointer;
    }
    .admin-login-box .btn-cancel:hover {
      border-color: #666;
      color: #aaa;
    }

    /* Admin mode indicator */
    .admin-mode-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #d4af37, #b8960c);
      color: #000;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
    }
    .admin-mode-bar .btn-logout {
      background: rgba(0,0,0,0.2);
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      color: #000;
      font-weight: 700;
      cursor: pointer;
    }
    .admin-mode-bar .btn-logout:hover {
      background: rgba(0,0,0,0.3);
    }
    body.admin-mode {
      padding-top: 40px;
    }

    /* Hidden admin trigger - now on footer logo */
    .footer-logo-img {
      cursor: pointer;
    }

    /* Admin click hint - subtle feedback */
    .footer-logo-img.admin-clicked {
      filter: brightness(1.2);
    }
  `;
  document.head.appendChild(style);
}

// Show admin mode bar
function showAdminModeBar() {
  document.body.classList.add('admin-mode');

  const bar = document.createElement('div');
  bar.className = 'admin-mode-bar';
  bar.innerHTML = `
    <span>관리자 모드</span>
    <button class="btn-logout" onclick="adminLogout()">로그아웃</button>
  `;
  document.body.prepend(bar);
}

// Add admin trigger to footer logo (5 clicks to activate)
function addAdminTrigger() {
  // Wait for footer logo to exist
  const checkForLogo = () => {
    const footerLogo = document.querySelector('.footer-logo-img');
    if (!footerLogo) {
      setTimeout(checkForLogo, 100);
      return;
    }

    let clickCount = 0;
    let clickTimer = null;

    footerLogo.addEventListener('click', function(e) {
      e.preventDefault();
      clickCount++;

      // Visual feedback
      footerLogo.classList.add('admin-clicked');
      setTimeout(() => footerLogo.classList.remove('admin-clicked'), 150);

      if (clickTimer) clearTimeout(clickTimer);

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 3000); // 3 seconds to complete 5 clicks

      if (clickCount >= 5) {
        clickCount = 0;
        if (!isAdminLoggedIn()) {
          showLoginModal();
        } else {
          // If already logged in, show a message
          alert('이미 관리자 모드입니다.');
        }
      }
    });
  };

  checkForLogo();
}

// Initialize admin system
function initAdmin() {
  addAdminStyles();
  addAdminTrigger();

  if (isAdminLoggedIn()) {
    showAdminModeBar();
  }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// Export functions
window.isAdminLoggedIn = isAdminLoggedIn;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
