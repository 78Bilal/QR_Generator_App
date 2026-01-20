// Admin User Detail JavaScript

// API çağrısı helper fonksiyonu
async function apiCall(url, method = 'GET', body = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    // 401 veya 403 hatası - yetki sorunu
    if (response.status === 401 || response.status === 403) {
      throw new Error('Admin paneline erişim yetkiniz yok. Lütfen giriş yapınız.');
    }
    throw new Error(data.error || 'İşlem başarısız oldu');
  }

  return data;
}

// Session Kontrolü - Admin Doğrulama
async function checkAdminAuth() {
  try {
    const response = await apiCall('/api/auth/check', 'GET');
    
    if (!response.authenticated) {
      throw new Error('Giriş yapmanız gerekir');
    }

    if (response.user.role !== 'admin') {
      throw new Error('Admin rolüne sahip değilsiniz');
    }

    return true;
  } catch (error) {
    console.error('Admin auth hatası:', error);
    throw error;
  }
}

// URL'den kullanıcı ID'sini al
function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Kullanıcı Detayını Yükle
async function loadUserDetail() {
  try {
    const userId = getUserIdFromURL();

    if (!userId) {
      throw new Error('Geçersiz kullanıcı ID');
    }

    // Admin yetkisini kontrol et
    await checkAdminAuth();

    const response = await apiCall(`/api/admin/user/${userId}`, 'GET');

    const user = response.data.user;
    const qrcodes = response.data.qrcodes;

    // Kullanıcı bilgilerini doldur
    document.getElementById('userUsername').textContent = escapeHtml(user.username);
    document.getElementById('userEmail').textContent = escapeHtml(user.email);
    
    const roleElement = document.getElementById('userRole');
    roleElement.classList.add(user.role);
    roleElement.textContent = user.role === 'admin' ? '⚙️ Admin' : '👤 Kullanıcı';
    
    document.getElementById('userCreatedAt').textContent = formatDate(user.created_at);

    // QR Kodlarını Doldur
    const qrGrid = document.getElementById('qrCodeGrid');
    const noQRMessage = document.getElementById('noQRMessage');
    const qrLoadingMessage = document.getElementById('qrLoadingMessage');

    if (!qrcodes || qrcodes.length === 0) {
      qrGrid.innerHTML = '';
      noQRMessage.classList.remove('hidden');
      qrLoadingMessage.style.display = 'none';
    } else {
      qrGrid.innerHTML = qrcodes.map(qr => `
        <div class="qr-item">
          <div class="qr-image-container">
            <img src="${escapeHtml(qr.qr_image)}" alt="QR Kod" />
          </div>
          <div class="qr-info">
            <div class="qr-data" title="${escapeHtml(qr.qr_data)}">
              📌 ${escapeHtml(qr.qr_data.substring(0, 50))}${qr.qr_data.length > 50 ? '...' : ''}
            </div>
            <div class="qr-date">
              📅 ${formatDate(qr.created_at)}
            </div>
          </div>
        </div>
      `).join('');
      noQRMessage.classList.add('hidden');
      qrLoadingMessage.style.display = 'none';
    }

    // Loading'i gizle, detay sayfasını göster
    const loadingContainer = document.getElementById('loadingContainer');
    const userDetailContainer = document.getElementById('userDetailContainer');

    if (loadingContainer) loadingContainer.style.display = 'none';
    if (userDetailContainer) userDetailContainer.style.display = 'block';
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);

    // Hata durumunda unauthorized göster
    const loadingContainer = document.getElementById('loadingContainer');
    const unauthorizedContainer = document.getElementById('unauthorizedContainer');

    if (loadingContainer) loadingContainer.style.display = 'none';
    if (unauthorizedContainer) unauthorizedContainer.classList.remove('hidden');
  }
}

// Çıkış Yap
function setupLogout() {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiCall('/api/auth/logout', 'POST');
        window.location.href = '/login.html';
      } catch (error) {
        alert('Çıkış hatası: ' + error.message);
      }
    });
  }
}

// Hamburger Menü
function setupHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navActions = document.getElementById('navActions');

  if (hamburgerBtn && navActions) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navActions.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-actions') && !e.target.closest('.hamburger')) {
        navActions.classList.remove('show');
      }
    });
  }
}

// HTML Escape (XSS Koruması)
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Tarihi Formatla
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  loadUserDetail();
  setupLogout();
  setupHamburgerMenu();
});

console.log('✓ Admin Detail JavaScript yüklendi');
