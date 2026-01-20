// Admin Panel JavaScript

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

// Kullanıcı Listesini Yükle
async function loadUsers() {
  try {
    const response = await apiCall('/api/admin/users', 'GET');
    
    const tableBody = document.getElementById('usersTableBody');
    const loadingMessage = document.getElementById('loadingMessage');

    if (!response.data || response.data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Kullanıcı bulunamadı</td></tr>';
      loadingMessage.style.display = 'none';
      return;
    }

    // Tabloyu doldur
    tableBody.innerHTML = response.data.map(user => `
      <tr onclick="viewUserDetail(${user.id})" style="cursor: pointer;">
        <td>${escapeHtml(user.username)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>
          <span class="role-badge ${user.role}">
            ${user.role === 'admin' ? '⚙️ Admin' : '👤 Kullanıcı'}
          </span>
        </td>
        <td>${formatDate(user.created_at)}</td>
        <td>
          <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); viewUserDetail(${user.id})">
            Detay →
          </button>
        </td>
      </tr>
    `).join('');

    loadingMessage.style.display = 'none';
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    const tableBody = document.getElementById('usersTableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-message">Hata: ${error.message}</td></tr>`;
    loadingMessage.style.display = 'none';
  }
}

// İstatistikleri Yükle
async function loadStats() {
  try {
    const response = await apiCall('/api/admin/stats', 'GET');
    
    if (response.data) {
      document.getElementById('totalUsers').textContent = response.data.totalUsers || 0;
      document.getElementById('totalQRCodes').textContent = response.data.totalQRCodes || 0;
    }
  } catch (error) {
    console.error('İstatistik hatası:', error);
    document.getElementById('totalUsers').textContent = '?';
    document.getElementById('totalQRCodes').textContent = '?';
  }
}

// Admin Panel Başlatma
async function initAdminPanel() {
  const loadingContainer = document.getElementById('loadingContainer');
  const adminContainer = document.getElementById('adminContainer');
  const unauthorizedContainer = document.getElementById('unauthorizedContainer');

  try {
    // Admin yetkisini kontrol et
    await checkAdminAuth();

    // İstatistikleri ve kullanıcıları yükle
    await loadStats();
    await loadUsers();

    // Loading'i gizle, panel'i göster
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'block';
  } catch (error) {
    console.error('Admin panel başlatma hatası:', error);

    // Hata durumunda unauthorized göster
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (unauthorizedContainer) unauthorizedContainer.classList.remove('hidden');
  }
}

// Kullanıcı Detay Sayfasına Git
function viewUserDetail(userId) {
  window.location.href = `/admin-detail?id=${userId}`;
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
  initAdminPanel();
  setupLogout();
  setupHamburgerMenu();
});

console.log('✓ Admin Panel JavaScript yüklendi');
