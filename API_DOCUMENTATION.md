/* 
  QR Kod Oluşturucu - API Dokümantasyonu
  
  Tüm API uç noktaları, parametreleri ve yanıtları burada açıklanmıştır.
*/

// ====================================
// KIMLIK DOĞRULAMA API'Sİ (/api/auth)
// ====================================

/*
  1. KAYIT (Register)
  ──────────────────
  Method: POST
  URL: /api/auth/register
  
  İstek Gövdesi:
  {
    "username": "kullanici_adi",
    "email": "kullanici@email.com",
    "password": "sifre123",
    "passwordConfirm": "sifre123"
  }
  
  Başarılı Yanıt (201):
  {
    "success": true,
    "message": "Kayıt başarıyla tamamlandı. Lütfen giriş yapınız."
  }
  
  Hata Yanıtları:
  - 400: "Lütfen tüm alanları doldurunuz"
  - 400: "Şifreler eşleşmiyor"
  - 400: "Şifre en az 6 karakter olmalıdır"
  - 400: "Bu email zaten kayıtlı"
  - 400: "Bu kullanıcı adı zaten alınmış"
*/

/*
  2. GİRİŞ (Login)
  ──────────────
  Method: POST
  URL: /api/auth/login
  
  İstek Gövdesi:
  {
    "email": "kullanici@email.com",
    "password": "sifre123"
  }
  
  Başarılı Yanıt (200):
  {
    "success": true,
    "message": "Giriş başarılı",
    "user": {
      "id": 1,
      "username": "kullanici_adi",
      "email": "kullanici@email.com"
    }
  }
  
  Hata Yanıtları:
  - 400: "Email ve şifre gereklidir"
  - 401: "Email veya şifre hatalı"
*/

/*
  3. ÇIKIŞ (Logout)
  ────────────────
  Method: POST
  URL: /api/auth/logout
  
  İstek Gövdesi: {} (boş)
  
  Başarılı Yanıt (200):
  {
    "success": true,
    "message": "Başarıyla çıkış yaptınız"
  }
*/

/*
  4. OTURUM KONTROLÜ (Check Auth)
  ──────────────────────────────
  Method: GET
  URL: /api/auth/check
  
  Başarılı Yanıt (200) - Giriş Yapılıysa:
  {
    "authenticated": true,
    "user": {
      "id": 1,
      "username": "kullanici_adi"
    }
  }
  
  Başarılı Yanıt (200) - Giriş Yapılmamışsa:
  {
    "authenticated": false
  }
*/

// ====================================
// QR KOD API'Sİ (/api/qr)
// ====================================

/*
  GEREKLI: Tüm QR API'leri oturum gerektirir (Session Cookie)
  
  1. QR KOD OLUŞTUR (Generate)
  ───────────────────────────
  Method: POST
  URL: /api/qr/generate
  Auth: Gerekli (Session)
  
  İstek Gövdesi:
  {
    "data": "https://example.com"
  }
  
  Başarılı Yanıt (201):
  {
    "success": true,
    "message": "QR kod başarıyla oluşturuldu",
    "qr": {
      "id": 1,
      "data": "https://example.com",
      "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "created_at": "2024-01-20T10:30:00.000Z"
    }
  }
  
  Hata Yanıtları:
  - 400: "QR kodu için veri gereklidir"
  - 401: "Yetkilendirme gereklidir. Lütfen giriş yapınız."
*/

/*
  2. QR KOD GEÇMİŞİ (History)
  ──────────────────────────
  Method: GET
  URL: /api/qr/history
  Auth: Gerekli (Session)
  
  Başarılı Yanıt (200):
  {
    "success": true,
    "count": 3,
    "qrcodes": [
      {
        "id": 1,
        "qr_data": "https://example.com",
        "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "created_at": "2024-01-20T10:30:00.000Z"
      },
      {
        "id": 2,
        "qr_data": "Tel: +1234567890",
        "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "created_at": "2024-01-20T09:15:00.000Z"
      }
    ]
  }
  
  Hata Yanıtları:
  - 401: "Yetkilendirme gereklidir. Lütfen giriş yapınız."
*/

/*
  3. BELİRLİ QR KOD GETIR (Get By ID)
  ──────────────────────────────────
  Method: GET
  URL: /api/qr/:id
  Auth: Gerekli (Session)
  
  Başarılı Yanıt (200):
  {
    "success": true,
    "qr": {
      "id": 1,
      "qr_data": "https://example.com",
      "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "created_at": "2024-01-20T10:30:00.000Z"
    }
  }
  
  Hata Yanıtları:
  - 401: "Yetkilendirme gereklidir. Lütfen giriş yapınız."
  - 404: "QR kod bulunamadı"
*/

/*
  4. QR KOD SİL (Delete)
  ────────────────────
  Method: DELETE
  URL: /api/qr/:id
  Auth: Gerekli (Session)
  
  Başarılı Yanıt (200):
  {
    "success": true,
    "message": "QR kod başarıyla silindi"
  }
  
  Hata Yanıtları:
  - 401: "Yetkilendirme gereklidir. Lütfen giriş yapınız."
  - 404: "QR kod bulunamadı"
*/

// ====================================
// KULLANIM ÖRNEKLERİ
// ====================================

// cURL Örnekleri:

// 1. Kayıt Ol
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123",
    "passwordConfirm": "securepass123"
  }'

// 2. Giriş Yap
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }' \
  -c cookies.txt

// 3. QR Kod Oluştur
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "data": "https://github.com"
  }'

// 4. QR Kodlarını Listele
curl -X GET http://localhost:3000/api/qr/history \
  -b cookies.txt

// 5. QR Kodu Sil
curl -X DELETE http://localhost:3000/api/qr/1 \
  -b cookies.txt

// ====================================
// HATA KODLARI
// ====================================

/*
  200 OK - İstek başarılı
  201 Created - Yeni kaynak oluşturuldu
  400 Bad Request - İstek parametreleri hatalı
  401 Unauthorized - Kimlik doğrulama başarısız
  404 Not Found - Kaynak bulunamadı
  500 Internal Server Error - Sunucu hatası
*/

// ====================================
// VERI TÜRLERİ
// ====================================

/*
  User (Kullanıcı):
  - id: number (Veritabanı ID)
  - username: string (Benzersiz kullanıcı adı)
  - email: string (Benzersiz e-posta)
  - password: string (Hashed şifre)
  - created_at: datetime (Oluşturma tarihi)
  
  QRCode:
  - id: number (Veritabanı ID)
  - user_id: number (Sahibi olan kullanıcı ID'si)
  - qr_data: string (QR kodun içeriği)
  - qr_image: string (Base64 PNG resim)
  - created_at: datetime (Oluşturma tarihi)
*/

// ====================================
// GÜVENLİK NOTLARI
// ====================================

/*
  1. Tüm şifreler bcrypt ile hashlenir
  2. Session cookie 24 saat geçerli
  3. Cookies httpOnly olarak ayarlanmış (XSS koruması)
  4. Parametrize SQL sorguları kullanılıyor (SQL injection koruması)
  5. Kullanıcılar sadece kendi verilerine erişebilir
  6. Oturum kontrol middleware tüm QR API'lerini korur
*/
