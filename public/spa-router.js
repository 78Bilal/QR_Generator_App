// SPA Router - Tüm sayfaları yönetir
let currentUser = null;
let currentPage = null;
let currentAdminDetailId = null;

// Sayfalara Git
function navigateTo(page, params = {}) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.add('hidden'));
    
    currentPage = page;
    
    // URL'yi güncelle - Dashboard ise "/" yaz
    if (page === 'admin-detail' && params.id) {
        window.history.pushState({}, '', `/admin-detail?id=${params.id}`);
    } else {
        window.history.pushState({}, '', page === 'dashboard' ? '/' : `/${page}`);
    }
    
    if (page === 'login') {
        document.getElementById('login-page').classList.remove('hidden');
        setupLoginForm();
    } else if (page === 'register') {
        document.getElementById('register-page').classList.remove('hidden');
        setupRegisterForm();
    } else if (page === 'dashboard') {
        document.getElementById('dashboard-page').classList.remove('hidden');
        setupDashboard();
    } else if (page === 'admin') {
        document.getElementById('admin-page').classList.remove('hidden');
        loadAdminPanel();
    } else if (page === 'admin-detail' && params.id) {
        document.getElementById('admin-detail-page').classList.remove('hidden');
        loadAdminDetail(params.id);
    }
}

// Başlangıç - Auth Kontrol
function initApp() {
    // URL'den page ve params'ı oku
    const pathname = window.location.pathname;
    const search = window.location.search;
    
    let targetPage = 'dashboard';
    let targetParams = {};
    
    if (pathname === '/login') {
        targetPage = 'login';
    } else if (pathname === '/register') {
        targetPage = 'register';
    } else if (pathname === '/admin-detail') {
        targetPage = 'admin-detail';
        const params = new URLSearchParams(search);
        if (params.has('id')) {
            targetParams.id = params.get('id');
        }
    } else if (pathname === '/admin') {
        targetPage = 'admin';
    } else if (pathname === '/dashboard') {
        targetPage = 'dashboard';
    }
    
    checkAuthStatus(targetPage, targetParams);
}

// Auth Durumunu Kontrol Et
function checkAuthStatus(targetPage = null, targetParams = {}) {
    fetch('/api/auth/check')
        .then(res => res.json())
        .then(data => {
            if (data.authenticated) {
                currentUser = data.user;
                
                // Admin linkini göster/gizle
                const adminLink = document.getElementById('admin-link');
                if (data.user.role === 'admin') {
                    adminLink.classList.remove('hidden');
                } else {
                    adminLink.classList.add('hidden');
                }
                
                // Eğer target page varsa ona git, yoksa dashboard
                if (targetPage && targetPage !== 'login' && targetPage !== 'register') {
                    navigateTo(targetPage, targetParams);
                } else {
                    navigateTo('dashboard');
                }
            } else {
                // Eğer target page login/register ise git, yoksa login'e yönlendir
                if (targetPage === 'login' || targetPage === 'register') {
                    navigateTo(targetPage);
                } else {
                    navigateTo('login');
                }
            }
        })
        .catch(err => {
            console.error('Auth check hatası:', err);
            navigateTo('login');
        });
}

// ==================== LOGIN FORM ====================
function setupLoginForm() {
    const form = document.getElementById('login-form');
    const messageDiv = document.getElementById('login-message');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                currentUser = data.user;
                messageDiv.innerHTML = '<span style="color: green;">Giriş başarılı! Yönlendiriliyorsunuz...</span>';
                setTimeout(() => checkAuthStatus(), 1000);
            } else {
                messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
            }
        } catch (err) {
            messageDiv.innerHTML = '<span style="color: red;">Bağlantı hatası!</span>';
        }
    };
}

// ==================== REGISTER FORM ====================
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    const messageDiv = document.getElementById('register-message');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (password !== passwordConfirm) {
            messageDiv.innerHTML = '<span style="color: red;">Şifreler eşleşmiyor!</span>';
            return;
        }
        
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                messageDiv.innerHTML = '<span style="color: green;">Kayıt başarılı! Giriş yapmaya yönlendiriliyorsunuz...</span>';
                setTimeout(() => navigateTo('login'), 1500);
            } else {
                messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
            }
        } catch (err) {
            messageDiv.innerHTML = '<span style="color: red;">Bağlantı hatası!</span>';
        }
    };
}

// ==================== DASHBOARD ====================
function setupDashboard() {
    // Kullanıcı bilgisini doldur
    if (currentUser) {
        document.getElementById('user-username').textContent = currentUser.username;
        document.getElementById('user-email').textContent = currentUser.email;
    }
    
    // QR Form
    const qrForm = document.getElementById('qr-form');
    qrForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const data = document.getElementById('qr-text').value;
        const type = document.getElementById('qr-type').value;
        
        try {
            const res = await fetch('/api/qr/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
            });
            
            const result = await res.json();
            
            if (res.ok) {
                document.getElementById('qr-image').src = result.qr.qr_image;
                document.getElementById('qr-result').classList.remove('hidden');
                loadQRHistory();
            }
        } catch (err) {
            console.error('QR oluşturma hatası:', err);
        }
    };
    
    // WiFi Alanlarını Göster/Gizle
    const qrTypeSelect = document.getElementById('qr-type');
    if (qrTypeSelect) {
        qrTypeSelect.onchange = (e) => {
            if (e.target.value === 'wifi') {
                document.getElementById('wifi-fields').classList.remove('hidden');
            } else {
                document.getElementById('wifi-fields').classList.add('hidden');
            }
        };
    }
    
    // QR Geçmişi Yükle
    loadQRHistory();
    
    // Hamburger Menü
    setupHamburgerMenu('hamburger', 'nav-links');
}

// QR Geçmişi Yükle
function loadQRHistory() {
    fetch('/api/qr/history')
        .then(res => res.json())
        .then(data => {
            const historyDiv = document.getElementById('qr-history');
            historyDiv.innerHTML = '';
            
            if (data.qrcodes && data.qrcodes.length > 0) {
                data.qrcodes.forEach(qr => {
                    const div = document.createElement('div');
                    div.className = 'qr-item';
                    div.innerHTML = `
                        <img src="${qr.qr_image}" alt="QR">
                        <p>${qr.qr_data}</p>
                        <small>${new Date(qr.created_at).toLocaleDateString('tr-TR')}</small>
                        <button onclick="deleteQR('${qr.id}')" class="btn-delete">Sil</button>
                    `;
                    historyDiv.appendChild(div);
                });
            }
        });
}

// QR Sil
function deleteQR(id) {
    if (confirm('QR Kod silinsin mi?')) {
        fetch(`/api/qr/delete/${id}`, { method: 'DELETE' })
            .then(() => loadQRHistory());
    }
}

// ==================== ADMIN PANEL ====================
function loadAdminPanel() {
    // Stats Yükle
    fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('total-users').textContent = data.total_users;
            document.getElementById('total-qrcodes').textContent = data.total_qrcodes;
        });
    
    // Kullanıcıları Yükle
    fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('users-tbody');
            tbody.innerHTML = '';
            
            if (data.users) {
                data.users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                        <td>
                            <button onclick="navigateTo('admin-detail', {id: ${user.id}})" class="btn">Detay</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        });
    
    setupHamburgerMenu('admin-hamburger', 'admin-nav-links');
}

// ==================== ADMIN DETAIL ====================
function loadAdminDetail(userId) {
    currentAdminDetailId = userId;
    fetch(`/api/admin/user/${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                document.getElementById('detail-username').textContent = data.user.username;
                document.getElementById('detail-email').textContent = data.user.email;
                document.getElementById('detail-role').textContent = data.user.role;
                document.getElementById('detail-created').textContent = new Date(data.user.created_at).toLocaleDateString('tr-TR');
                
                // QR Kodları Yükle
                const qrDiv = document.getElementById('detail-qrcodes');
                qrDiv.innerHTML = '';
                
                if (data.qrcodes && data.qrcodes.length > 0) {
                    data.qrcodes.forEach(qr => {
                        const div = document.createElement('div');
                        div.className = 'qr-item';
                        div.innerHTML = `
                            <img src="${qr.qr_image}" alt="QR">
                            <p>${qr.qr_data}</p>
                            <small>${new Date(qr.created_at).toLocaleDateString('tr-TR')}</small>
                        `;
                        qrDiv.appendChild(div);
                    });
                } else {
                    qrDiv.innerHTML = '<p>Bu kullanıcının QR kodu yok</p>';
                }
            }
        });
    
    setupHamburgerMenu('detail-hamburger', 'detail-nav-links');
}

// ==================== USER PANEL ====================
function toggleUserPanel() {
    document.getElementById('user-panel-modal').classList.toggle('hidden');
}

function closeUserPanel() {
    document.getElementById('user-panel-modal').classList.add('hidden');
    document.getElementById('password-change-modal').classList.add('hidden');
    document.getElementById('delete-account-modal').classList.add('hidden');
}

function togglePasswordChange() {
    document.getElementById('password-change-modal').classList.toggle('hidden');
}

function toggleDeleteAccount() {
    document.getElementById('delete-account-modal').classList.toggle('hidden');
}

// Şifre Değiştir
document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) {
        passwordForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const newPasswordConfirm = document.getElementById('new-password-confirm').value;
            
            if (newPassword !== newPasswordConfirm) {
                alert('Yeni şifreler eşleşmiyor!');
                return;
            }
            
            try {
                const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    alert('Şifre başarıyla değiştirildi!');
                    closeUserPanel();
                } else {
                    alert(data.message || 'Şifre değiştirme hatası!');
                }
            } catch (err) {
                alert('Bağlantı hatası!');
            }
        };
    }
    
    // Hesabı Sil
    const deleteForm = document.getElementById('delete-account-form');
    if (deleteForm) {
        deleteForm.onsubmit = async (e) => {
            e.preventDefault();
            
            if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
                return;
            }
            
            const password = document.getElementById('delete-password').value;
            
            try {
                const res = await fetch('/api/auth/delete-account', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    alert('Hesabınız silindi!');
                    logout();
                } else {
                    alert(data.message || 'Hesap silme hatası!');
                }
            } catch (err) {
                alert('Bağlantı hatası!');
            }
        };
    }
});

// ==================== LOGOUT ====================
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            navigateTo('login');
        });
}

// ==================== HAMBURGER MENU ====================
function setupHamburgerMenu(hamburgerId, navLinksId) {
    const hamburger = document.getElementById(hamburgerId);
    const navLinks = document.getElementById(navLinksId);
    
    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            navLinks.classList.toggle('active');
        };
        
        // Link tıklandığında menüyü kapat
        navLinks.querySelectorAll('a').forEach(link => {
            link.onclick = () => {
                navLinks.classList.remove('active');
            };
        });
    }
}

// QR İndir
function downloadQR() {
    const img = document.getElementById('qr-image');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'qr-code.png';
    link.click();
}

// Başlat
window.addEventListener('DOMContentLoaded', initApp);
