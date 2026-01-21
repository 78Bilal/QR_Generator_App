# QR Kod Oluşturucu + Admin Paneli

Kapsamlı bir Single Page Application (SPA) QR kod oluşturma uygulaması:
- ✅ Kullanıcı kimlik doğrulama ve hesap yönetimi
- ✅ QR kod oluşturma ve yönetim sistemi
- ✅ Admin paneli ile kullanıcı yönetimi
- ✅ Şifre değiştir, hesap sil fonksiyonları
- ✅ Responsive tasarım
- ✅ Session tabanlı güvenlik

## 🚀 Teknolojiler

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Veritabanı**: SQLite3
- **Kimlik Doğrulama**: Session + bcrypt
- **QR Kütüphanesi**: qrcode

## 📁 Klasör Yapısı

```
QR-Code_Generator/
├── server.js                 # Express ana sunucu
├── package.json              # Paket tanımı
├── database/
│   └── db.sqlite            # SQLite veritabanı (otomatik oluşturulur)
├── routes/
│   ├── auth.js              # Kimlik doğrulama rotaları
│   ├── qr.js                # QR kod işlemleri rotaları
│   └── admin.js             # Admin paneli API rotaları
├── middleware/
│   ├── authMiddleware.js     # Oturum kontrol middleware
│   └── adminMiddleware.js    # Admin yetki kontrol middleware
└── public/
    ├── index.html           # SPA Ana sayfa (tüm sayfaları içerir)
    ├── spa-router.js        # Client-side routing motoru
    ├── style.css            # Tüm stiller
    └── script.js            # Eski frontend kodu (kullanılmıyor)
```

## 🔧 Kurulum ve Çalıştırma

### 1. Paketleri Yükle
```bash
npm install
```

### 2. Sunucuyu Başlat
```bash
node server.js
```

Sunucu çalıştığında:
- Express server `http://localhost:3000` adresinde başlar
- SQLite veritabanı otomatik oluşturulur
- Admin hesabı otomatik oluşturulur (admin@example.com / admin123)
- Tüm tablolar hazırlanır

### 3. Tarayıcıda Açın
```
http://localhost:3000
```

### 4. Giriş Yap
- **Email**: admin@example.com
- **Şifre**: admin123
- **Sonra Kayıt Ol** kısmından yeni kullanıcı oluşturabilirsiniz

## ✨ Özellikler

### Backend Özellikleri
✅ Express.js sunucu kurulumu  
✅ SQLite veritabanı bağlantısı  
✅ Kullanıcılar ve QR kodları tabloları  
✅ bcrypt ile şifre hashleme  
✅ Session tabanlı oturum kontrolü  
✅ Admin/User rol yönetimi  
✅ QR kod oluşturma API  
✅ Kullanıcıya ait QR geçmişi  
✅ Admin paneli - Kullanıcı yönetimi  
✅ Admin paneli - İstatistikler (toplam kullanıcı, QR kod sayısı)  
✅ Şifre değiştir fonksiyonu  
✅ Hesap silme fonksiyonu  

### Frontend Özellikleri
✅ Single Page Application (SPA) mimarisi  
✅ Client-side routing (URL: `/`, `/login`, `/register`, `/admin`, `/admin-detail`)  
✅ Modern, responsive tasarım  
✅ QR kod oluşturma formu  
✅ Gerçek zamanlı QR görüntüleme ve indirme  
✅ QR geçmişi dashboard  
✅ Kullanıcı hesap ayarları paneli  
✅ Şifre değiştir modali  
✅ Hesap silme modali  
✅ Admin paneli - Tüm kullanıcıları listele  
✅ Admin paneli - Kullanıcı detayları ve QR kodları görüntüle  
✅ Hamburger menü (mobile responsive)  
✅ Mobil uyumlu tasarım  

## 🔐 API Uç Noktaları

### Kimlik Doğrulama
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/check` - Oturum ve rol bilgisini kontrol et
- `POST /api/auth/change-password` - Şifre değiştir
- `POST /api/auth/delete-account` - Hesabı sil

### QR Kod Yönetimi
- `POST /api/qr/generate` - QR kod oluştur (Oturum Gerekli)
- `GET /api/qr/history` - Tüm QR kodlarını listele (Oturum Gerekli)
- `GET /api/qr/:id` - Belirli QR kodunu getir (Oturum Gerekli)
- `DELETE /api/qr/:id` - QR kodunu sil (Oturum Gerekli)

### Admin Paneli (Admin Gerekli)
- `GET /api/admin/stats` - İstatistikler (toplam kullanıcı, QR kod sayısı)
- `GET /api/admin/users` - Tüm kullanıcıları listele
- `GET /api/admin/user/:id` - Belirli kullanıcı ve QR kodlarını getir

## 📝 Kullanım Örneği

### Başlangıç Kimlik Bilgileri
Sistem başlatıldığında otomatik admin hesabı oluşturulur:
- **Email**: `admin@example.com`
- **Şifre**: `admin123`
- **Rol**: `admin`

### 1. Kayıt Ol
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "kullanici",
  "email": "kullanici@email.com",
  "password": "sifre123"
}
```

### 2. Giriş Yap
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "kullanici@email.com",
  "password": "sifre123"
}
```

### 3. QR Kod Oluştur
```javascript
POST /api/qr/generate
Content-Type: application/json

{
  "data": "https://example.com"
}
```

### 4. Admin - Tüm Kullanıcıları Görüntüle
```javascript
GET /api/admin/users
(Admin hesabı gerekli)
```

### 5. Admin - İstatistikler
```javascript
GET /api/admin/stats
(Admin hesabı gerekli)
```

## 🎨 Tasarım Özellikleri

- Gradient arka plan (Mor-Mavi)
- Smooth animasyonlar ve transitions
- Box-shadow efektleri
- Responsive grid sistemi
- Mobile-first tasarım
- Tema renkleri: #667eea (Mavi), #764ba2 (Mor), #f5576c (Kırmızı)
- Hamburger menü (Mobilde aktif)
- Modern modal tasarımı (Şifre değiştir, Hesap sil, Kullanıcı paneli)
- Admin paneli ile istatistik kartları
- Tablo görünümü (Kullanıcı listesi)

## ⚙️ Teknik Detaylar

### Veritabanı Şeması

**users tablosu**
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- role ('admin' veya 'user')
- created_at

**qrcodes tablosu**
- id (PK)
- user_id (FK)
- qr_data (QR içeriği)
- qr_image (Data URL formatı)
- created_at

**wifi_codes tablosu** (Opsiyonel)
- id (PK)
- user_id (FK)
- ssid (WiFi adı)
- password (WiFi şifresi)
- security (WPA/WEP/nopass)
- qr_code (Data URL formatı)
- created_at

### Session Yönetimi
- Express-session middleware kullanılıyor
- Cookie tabanlı session
- 24 saat geçerlilik süresi
- httpOnly ve secure ayarları

### Güvenlik
- Şifreler bcrypt (10 salt rounds) ile hashlenmiş
- Session cookie 24 saat geçerli
- httpOnly cookie (XSS koruması)
- SQL injection koruması (parameterized queries)
- CSRF koruması (session kullanımı)
- Admin middleware ile rol kontrol
- Password en az 6 karakter (opsiyonel)

## 🐛 Troubleshooting

### Port 3000 zaten kullanılıyorsa
```bash
# Farklı port belirt
PORT=3001 node server.js
```

### Veritabanı problemi
```bash
# database klasörü silin ve yeniden çalıştırın
rm database/db.sqlite
node server.js
```

### Modül bulunamadı hatası
```bash
# Paketleri yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

## 📱 Uyumluluk

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobil cihazlar (Responsive)
- ✅ Tablet cihazlar
- ✅ Windows, macOS, Linux

## 📄 Lisans

MIT

## 🤝 Katkı

Hata bulunur veya öneriler için issue açınız.

---

**Yapılan Tarih**: Ocak 2026  
**Versiyon**: 1.0.0
# QR_Generator_App
