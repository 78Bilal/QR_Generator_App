// QR Kod Oluşturucu - Frontend JavaScript Kodu

// ============= GENEL FONKSİYONLAR =============

// SessionStorage key'leri
const STORAGE_KEY = 'guestQRCodes';

// API istekleri yapmak için genel fonksiyon
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // POST/PUT/DELETE istek ise data gönder
    if (data) {
      options.body = JSON.stringify(data);
    }

    // API'ye istek yap
    const response = await fetch(endpoint, options);
    const responseData = await response.json();

    // İstek başarısız mı kontrol et
    if (!response.ok) {
      throw new Error(responseData.error || 'Bir hata oluştu');
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

// Mesaj gösterme fonksiyonu
function showMessage(elementId, message, type = 'error') {
  const messageElement = document.getElementById(elementId);
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
      messageElement.classList.add('hidden');
    }, 5000);
  }
}

// Giriş yapmış kullanıcı kontrolü
async function checkAuthentication() {
  try {
    const response = await apiCall('/api/auth/check');
    return response.authenticated;
  } catch (error) {
    return false;
  }
}

// ============= INDEX SAYFASI =============

// Ana sayfaya gelenleri dashboard'a yönlendir
// (Giriş yapmış veya yapmamış olsun, herkes dashboard kullanabilecek)
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  window.location.href = '/dashboard.html';
}

// ============= LOGIN SAYFASI =============

// Sayfa tam yüklenince login formunu dinle
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Form verilerini al
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // API'ye giriş isteği gönder
        const response = await apiCall('/api/auth/login', 'POST', {
          email: email,
          password: password
        });

        // Başarılı giriş
        showMessage('message', response.message, 'success');

        // 1 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } catch (error) {
        // Hata mesajı göster
        showMessage('message', error.message, 'error');
      }
    });
  }
});

// ============= REGISTER SAYFASI =============

// Sayfa tam yüklenince register formunu dinle
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Form verilerini al
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      try {
        // API'ye kayıt isteği gönder
        const response = await apiCall('/api/auth/register', 'POST', {
          username: username,
          email: email,
          password: password,
          passwordConfirm: passwordConfirm
        });

        // Başarılı kayıt
        showMessage('message', response.message, 'success');

        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      } catch (error) {
        // Hata mesajı göster
        showMessage('message', error.message, 'error');
      }
    });
  }
});

// ============= DASHBOARD SAYFASI =============

// SessionStorage'dan QR kodlarını al
function getGuestQRCodes() {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// SessionStorage'a QR kodu ekle
function addGuestQRCode(qrData, qrImage) {
  const codes = getGuestQRCodes();
  codes.unshift({
    id: Date.now(),
    qr_data: qrData,
    qr_image: qrImage,
    created_at: new Date().toLocaleString('tr-TR')
  });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
}

// SessionStorage'dan QR kodunu sil
function deleteGuestQRCode(id) {
  const codes = getGuestQRCodes();
  const filtered = codes.filter(c => c.id !== id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Sayfa yüklendiğinde dashboard bileşenlerini başlat
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Giriş durumunu kontrol et
    await checkAuthStatus();
    
    // Dashboard sayfası yüklendiğinde
    if (document.getElementById('qrForm')) {
      // Kullanıcı bilgisini ve QR kodlarını yükle
      await loadUserInfo();
      await loadQRHistory();
      
      // Loading spinner'ı gizle ve dashboard'ı göster
      const loadingContainer = document.getElementById('loadingContainer');
      const dashboardContainer = document.getElementById('dashboardContainer');
      if (loadingContainer) loadingContainer.style.display = 'none';
      if (dashboardContainer) dashboardContainer.style.display = 'block';
    }
  } catch (error) {
    console.error('Dashboard başlatma hatası:', error);
    // Hata durumunda yine loading'i gizle ve dashboard'ı göster
    const loadingContainer = document.getElementById('loadingContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
  }

  // Çıkış yapma işlemi
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiCall('/api/auth/logout', 'POST');
        window.location.href = '/login.html';
      } catch (error) {
        alert('Çıkış yapılırken hata: ' + error.message);
      }
    });
  }

  // Dashboard sayfası yüklendiğinde formları ve sekmeleri ayarla
  if (document.getElementById('qrForm')) {
    // Sekme Yönetimi
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Tüm tab butonlarından active sınıfını kaldır
        tabBtns.forEach(b => b.classList.remove('active'));
        // Tıklanan butona active sınıfını ekle
        btn.classList.add('active');

        // Tüm tab içeriklerini gizle
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Seçilen tab içeriğini göster
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // QR Oluşturma Formu (URL/Metin) - GİRİŞ YAPMAYAN KULLANICILAR İÇİN DE ÇALIŞACAK
    const qrForm = document.getElementById('qrForm');
    qrForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const qrData = document.getElementById('qrData').value.trim();

      // Veri boş mu kontrol et
      if (!qrData) {
        showMessage('generateMessage', 'Lütfen QR kodu için veri girin', 'error');
        return;
      }

      try {
        // API'ye QR oluşturma isteği gönder (giriş yapmamışsa DB'ye kaydetmeyecek)
        const response = await apiCall('/api/qr/generate', 'POST', {
          data: qrData
        });

        // QR kodunu ekranda göster
        const qrImage = document.getElementById('qrImage');
        qrImage.src = response.qr.image;
        
        const qrResult = document.getElementById('qrResult');
        qrResult.classList.add('visible');

        // Başarı mesajı göster
        showMessage('generateMessage', '✅ QR kod başarıyla oluşturuldu!', 'success');

        // Eğer giriş yapılmamışsa sessionStorage'a kaydet
        if (!isUserLoggedIn()) {
          addGuestQRCode(qrData, response.qr.image);
        }

        // Formu temizle
        qrForm.reset();

        // QR geçmişini yenile
        loadQRHistory();
      } catch (error) {
        showMessage('generateMessage', error.message, 'error');
      }
    });

    // WiFi QR Oluşturma Formu - GİRİŞ YAPMAYAN KULLANICILAR İÇİN DE ÇALIŞACAK
    const wifiForm = document.getElementById('wifiForm');
    if (wifiForm) {
      wifiForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ssid = document.getElementById('wifiSSID').value.trim();
        const password = document.getElementById('wifiPassword').value.trim();
        const security = document.getElementById('wifiSecurity').value;

        // SSID boş mu kontrol et
        if (!ssid) {
          showMessage('generateMessage', 'Lütfen WiFi ağı adını girin', 'error');
          return;
        }

        // Şifresiz ağ için şifre istemez
        if (security !== 'nopass' && !password) {
          showMessage('generateMessage', 'Lütfen WiFi şifresini girin', 'error');
          return;
        }

        try {
          // WiFi QR kod formatı: WIFI:T:WPA;S:NetworkName;P:Password;;
          let wifiString = `WIFI:T:${security};S:${ssid}`;
          
          // Eğer açık ağ değilse şifre ekle
          if (security !== 'nopass') {
            wifiString += `;P:${password}`;
          }
          
          wifiString += ';;';

          // API'ye QR oluşturma isteği gönder (WiFi verisini gönder)
          const response = await apiCall('/api/qr/generate', 'POST', {
            data: wifiString
          });

          // QR kodunu ekranda göster
          const qrImage = document.getElementById('qrImage');
          qrImage.src = response.qr.image;
          
          const qrResult = document.getElementById('qrResult');
          qrResult.classList.add('visible');

          // Başarı mesajı göster
          showMessage('generateMessage', '📶 WiFi QR kodu başarıyla oluşturuldu!', 'success');

          // Eğer giriş yapılmamışsa sessionStorage'a kaydet
          if (!isUserLoggedIn()) {
            addGuestQRCode(wifiString, response.qr.image);
          }

          // Formu temizle
          wifiForm.reset();

          // QR geçmişini yenile
          loadQRHistory();
        } catch (error) {
          showMessage('generateMessage', error.message, 'error');
        }
      });
    }

    // İndir Butonu
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const qrImage = document.getElementById('qrImage');
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = 'qr-code-' + new Date().getTime() + '.png';
        link.click();
      });
    }

    // Temizle Butonu
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('qrResult').classList.remove('visible');
      });
    }
  }
});

// Kullanıcının giriş yapıp yapmadığını kontrol et
function isUserLoggedIn() {
  const userMenu = document.getElementById('userMenu');
  return userMenu && userMenu.style.display !== 'none';
}

// Giriş durumunu kontrol et ve menüyü güncelle
async function checkAuthStatus() {
  try {
    const response = await apiCall('/api/auth/check');
    const userMenu = document.getElementById('userMenu');
    const guestMenu = document.getElementById('guestMenu');
    const guestInfo = document.getElementById('guestInfo');
    const adminLinkBtn = document.getElementById('adminLinkBtn');

    if (response && response.authenticated) {
      // Kullanıcı giriş yapmış
      if (userMenu) userMenu.style.display = 'flex';
      if (guestMenu) guestMenu.style.display = 'none';
      if (guestInfo) guestInfo.classList.add('hidden');
      
      // Kullanıcı adını göster
      if (response.user && response.user.username) {
        document.getElementById('username').textContent = `👤 ${response.user.username}`;
      }

      // Admin linki göster/gizle
      if (adminLinkBtn) {
        if (response.user && response.user.role === 'admin') {
          adminLinkBtn.style.display = 'block';
        } else {
          adminLinkBtn.style.display = 'none';
        }
      }
    } else {
      // Kullanıcı giriş yapmamış
      if (userMenu) userMenu.style.display = 'none';
      if (guestMenu) guestMenu.style.display = 'flex';
      if (guestInfo) guestInfo.classList.remove('hidden');
      if (adminLinkBtn) adminLinkBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Auth status kontrol hatası:', error);
    // Hata durumunda guest olarak devam et
    const userMenu = document.getElementById('userMenu');
    const guestMenu = document.getElementById('guestMenu');
    const adminLinkBtn = document.getElementById('adminLinkBtn');
    if (userMenu) userMenu.style.display = 'none';
    if (guestMenu) guestMenu.style.display = 'flex';
    if (adminLinkBtn) adminLinkBtn.style.display = 'none';
  }
}

// Kullanıcı bilgisini yükle ve göster
async function loadUserInfo() {
  try {
    const response = await apiCall('/api/auth/check');
    if (response.authenticated) {
      document.getElementById('username').textContent = 
        `👤 ${response.user.username}`;
    }
  } catch (error) {
    console.error('Kullanıcı bilgisi alınamadı:', error);
  }
}

// QR Kod geçmişini yükle ve göster (Üyeli ve Üyesiz kullanıcılar için)
async function loadQRHistory() {
  const memberHistory = document.getElementById('memberQRHistory');
  const guestHistory = document.getElementById('guestQRHistory');
  const noHistory = document.getElementById('noHistoryMessage');

  try {
    // Giriş durumunu kontrol et
    const response = await apiCall('/api/auth/check');

    if (response.authenticated) {
      // Üyeli kullanıcı - DB'den çek
      try {
        const dbResponse = await apiCall('/api/qr/history');
        
        if (dbResponse.qrcodes && dbResponse.qrcodes.length > 0) {
          memberHistory.innerHTML = dbResponse.qrcodes.map(qr => `
            <div class="qr-card">
              <img src="${qr.qr_image}" alt="QR Kod">
              <div class="qr-card-info">
                <div class="qr-card-data">${qr.qr_data}</div>
                <div class="qr-card-date">
                  📅 ${new Date(qr.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
              <div class="qr-card-actions">
                <button class="btn btn-success" onclick="downloadQRCode('${qr.qr_image}', '${qr.id}')">
                  ⬇️ İndir
                </button>
                <button class="btn btn-danger" onclick="deleteQRCode(${qr.id})">
                  🗑️ Sil
                </button>
              </div>
            </div>
          `).join('');
          memberHistory.style.display = 'grid';
          noHistory.style.display = 'none';
        } else {
          memberHistory.style.display = 'none';
          guestHistory.style.display = 'none';
          noHistory.style.display = 'block';
        }
      } catch (error) {
        console.error('DB\'den geçmiş çekme hatası:', error);
        memberHistory.style.display = 'none';
        guestHistory.style.display = 'none';
        noHistory.style.display = 'block';
      }
    } else {
      // Üyesiz kullanıcı - SessionStorage'dan çek
      const guestCodes = getGuestQRCodes();
      
      if (guestCodes.length > 0) {
        guestHistory.innerHTML = guestCodes.map(qr => `
          <div class="qr-card">
            <img src="${qr.qr_image}" alt="QR Kod">
            <div class="qr-card-info">
              <div class="qr-card-data">${qr.qr_data}</div>
              <div class="qr-card-date">
                📅 ${qr.created_at}
              </div>
            </div>
            <div class="qr-card-actions">
              <button class="btn btn-success" onclick="downloadQRCode('${qr.qr_image}', '${qr.id}')">
                ⬇️ İndir
              </button>
              <button class="btn btn-danger" onclick="deleteGuestQRCodeUI(${qr.id})">
                🗑️ Sil
              </button>
            </div>
          </div>
        `).join('');
        guestHistory.style.display = 'grid';
        memberHistory.style.display = 'none';
        noHistory.style.display = 'none';
      } else {
        memberHistory.style.display = 'none';
        guestHistory.style.display = 'none';
        noHistory.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('QR geçmişi yükleme hatası:', error);
    memberHistory.style.display = 'none';
    guestHistory.style.display = 'none';
    noHistory.style.display = 'block';
  }
}

// QR kodunu indir
function downloadQRCode(imageData, id) {
  const link = document.createElement('a');
  link.href = imageData;
  link.download = 'qr-code-' + id + '.png';
  link.click();
}

// Üyeli kullanıcı için QR kodunu sil (DB'den)
async function deleteQRCode(id) {
  // Silme işlemini onayla
  if (!confirm('Bu QR kodunu silmek istediğinize emin misiniz?')) {
    return;
  }

  try {
    const response = await apiCall(`/api/qr/${id}`, 'DELETE');
    
    // Başarılı silme mesajı göster
    showMessage('generateMessage', response.message, 'success');

    // QR geçmişini yenile
    loadQRHistory();
  } catch (error) {
    showMessage('generateMessage', 'Silme işlemi hatası: ' + error.message, 'error');
  }
}

// Üyesiz kullanıcı için QR kodunu sil (SessionStorage'dan)
function deleteGuestQRCodeUI(id) {
  // Silme işlemini onayla
  if (!confirm('Bu QR kodunu silmek istediğinize emin misiniz?')) {
    return;
  }

  // SessionStorage'dan sil
  deleteGuestQRCode(id);

  // Başarılı silme mesajı göster
  showMessage('generateMessage', '✅ QR kod silindi', 'success');

  // QR geçmişini yenile
  loadQRHistory();
}

// ============= AUTHENTICATION KONTROLÜ =============

// Dashboard sayfasında giriş kontrolü - GİRİŞ YAPMAMIŞSA DA SAYFAyı AÇACAK (Ama GEÇMIŞ görüntülemek için giriş gerekli)
window.addEventListener('load', async () => {
  const currentPath = window.location.pathname;
  
  // Dashboard sayfasında giriş zorunluluğunu kaldırdık - herkes açabilecek
  // Üyesiz kullanıcılar sessionStorage'dan geçmiş görecek
  // Üyeli kullanıcılar DB'den geçmiş görecek
  
  // Eğer login/register'da isek ve giriş yapmış isek dashboard'a yönlendir
  if ((currentPath.includes('login') || currentPath.includes('register')) && currentPath !== '/') {
    try {
      const response = await apiCall('/api/auth/check');
      if (response.authenticated) {
        window.location.href = '/dashboard.html';
      }
    } catch (error) {
      // Hata durumunda sayfada kalsın
    }
  }
});

// Hamburger Menü
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navActions = document.getElementById("navActions");

if (hamburgerBtn && navActions) {
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navActions.classList.toggle("show");
  });

  // Menü dışında tıklanırsa kapat
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.nav-actions') && !e.target.closest('.hamburger')) {
      navActions.classList.remove("show");
    }
  });

  // Ekran yeniden boyutlandırıldığında menüyü kapat
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navActions.classList.remove("show");
    }
  });
}

// Touch Event Desteği
if ('ontouchstart' in window) {
  document.documentElement.classList.add('touch-device');
}

// Viewport Optimizasyonu
const handleOrientation = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (window.innerHeight < 500) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
  } else {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
};

window.addEventListener('orientationchange', handleOrientation);
window.addEventListener('resize', handleOrientation);

// Mobil Gesture Desteği
let touchStartX = 0;
let touchEndX = 0;

const handleSwipe = () => {
  if (touchEndX < touchStartX - 50) {
    // Sağa kaydırma - menüyü kapat
    navActions.classList.remove("show");
  }
  if (touchEndX > touchStartX + 50) {
    // Sola kaydırma - menüyü aç (opsiyonel)
  }
};

if ('ontouchstart' in window) {
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
}

// ===== KULLANICI PANELİ FONKSİYONLARI =====

// Kullanıcı Panel Modal Yönetimi
function initUserPanel() {
  const userPanelBtn = document.getElementById('userPanelBtn');
  const userPanelModal = document.getElementById('userPanelModal');
  const closePanelBtn = document.getElementById('closePanelBtn');
  
  // Panel açma
  if (userPanelBtn) {
    userPanelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userPanelModal.classList.remove('hidden');
    });
  }

  // Panel kapama
  if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
      userPanelModal.classList.add('hidden');
    });
  }

  // Overlay tıklanınca kapanma
  const modalOverlay = userPanelModal.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', () => {
      userPanelModal.classList.add('hidden');
    });
  }

  // Şifre Değiştir Modal
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const changePasswordModal = document.getElementById('changePasswordModal');
  const closePasswordBtn = document.getElementById('closePasswordBtn');
  const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
  
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      userPanelModal.classList.add('hidden');
      changePasswordModal.classList.remove('hidden');
    });
  }

  if (closePasswordBtn) {
    closePasswordBtn.addEventListener('click', () => {
      changePasswordModal.classList.add('hidden');
    });
  }

  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', () => {
      changePasswordModal.classList.add('hidden');
    });
  }

  // Password Modal Overlay
  const passwordOverlay = changePasswordModal.querySelector('.modal-overlay');
  if (passwordOverlay) {
    passwordOverlay.addEventListener('click', () => {
      changePasswordModal.classList.add('hidden');
    });
  }

  // Hesap Sil Onay Modal
  const deleteAccountPanelBtn = document.getElementById('deleteAccountPanelBtn');
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const closeDeleteBtn = document.getElementById('closeDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  
  if (deleteAccountPanelBtn) {
    deleteAccountPanelBtn.addEventListener('click', () => {
      userPanelModal.classList.add('hidden');
      deleteConfirmModal.classList.remove('hidden');
    });
  }

  if (closeDeleteBtn) {
    closeDeleteBtn.addEventListener('click', () => {
      deleteConfirmModal.classList.add('hidden');
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteConfirmModal.classList.add('hidden');
    });
  }

  // Delete Modal Overlay
  const deleteOverlay = deleteConfirmModal.querySelector('.modal-overlay');
  if (deleteOverlay) {
    deleteOverlay.addEventListener('click', () => {
      deleteConfirmModal.classList.add('hidden');
    });
  }
}

// Şifre Değiştir Form İşlemi
function initPasswordChangeForm() {
  const changePasswordForm = document.getElementById('changePasswordForm');
  
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
      const passwordMessage = document.getElementById('passwordMessage');
      
      try {
        const response = await apiCall('/api/auth/change-password', 'POST', {
          currentPassword,
          newPassword,
          newPasswordConfirm
        });
        
        // Başarı mesajı göster
        passwordMessage.classList.remove('hidden', 'error');
        passwordMessage.classList.add('success');
        passwordMessage.textContent = '✓ Şifre başarıyla değiştirildi!';
        
        // Formu temizle
        changePasswordForm.reset();
        
        // 2 saniye sonra modal'ı kapat
        setTimeout(() => {
          document.getElementById('changePasswordModal').classList.add('hidden');
          passwordMessage.classList.add('hidden');
        }, 2000);
      } catch (error) {
        // Hata mesajı göster
        passwordMessage.classList.remove('hidden', 'success');
        passwordMessage.classList.add('error');
        passwordMessage.textContent = '✗ ' + error.message;
      }
    });
  }
}

// Hesap Sil İşlemi
function initDeleteAccount() {
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        const response = await apiCall('/api/auth/delete-account', 'POST');
        
        // Başarı mesajı
        alert('✓ Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...');
        
        // Login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1000);
      } catch (error) {
        alert('✗ Hesap silme hatası: ' + error.message);
      }
    });
  }
}

// Kullanıcı Bilgisini Panel'e Yükle
function loadUserInfoToPanel() {
  const userPanelBtn = document.getElementById('userPanelBtn');
  const panelUsername = document.getElementById('panelUsername');
  const panelEmail = document.getElementById('panelEmail');
  
  if (userPanelBtn && localStorage.getItem('username')) {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    
    if (panelUsername) panelUsername.textContent = username;
    if (panelEmail) panelEmail.textContent = email;
  }
}

// Dashboard yüklenirken kullanıcı panel'ini başlat
if (document.getElementById('dashboardContainer')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Panel fonksiyonlarını başlat
    initUserPanel();
    initPasswordChangeForm();
    initDeleteAccount();
    
    // Kullanıcı bilgisini panel'e yükle (checkAuthStatus'ten sonra)
    setTimeout(() => {
      loadUserInfoToPanel();
    }, 500);
  });
}

console.log('✓ Frontend JavaScript yüklendi');
