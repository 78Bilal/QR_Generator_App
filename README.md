# 🚀 QR Generator App + Admin Paneli

![GitHub repo size](https://img.shields.io/github/repo-size/78Bilal/repo-ismi?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/78Bilal/repo-ismi?style=for-the-badge&color=blue)
![License](https://img.shields.io/github/license/78Bilal/repo-ismi?style=for-the-badge&color=green)

Modern, güvenli ve **Single Page Application (SPA)** mimarisiyle geliştirilmiş, tam kapsamlı bir QR Kod yönetim sistemidir. Kullanıcılar kendi QR geçmişlerini yönetirken, adminler tüm sistemi kontrol edebilir.

[✨ Özellikler](#-özellikler) • [🧠 Teknolojiler](#-kullanılan-teknolojiler) • [⚙️ Kurulum](#️-kurulum) • [🔐 API](#-api-endpointleri) • [📱 Uyumluluk](#-uyumluluk)

---

## ✨ Özellikler

* **SPA Mimari:** Sayfa yenilenmeden hızlı geçişler (Custom Client-side Router).
* **Kullanıcı Yönetimi:** Kayıt, giriş, şifre güncelleme ve hesap silme.
* **QR İşlemleri:** QR oluşturma, geçmişi görüntüleme ve silme.
* **Admin Paneli:** Detaylı kullanıcı istatistikleri ve yönetim yetkileri.
* **Güvenlik:** Session tabanlı kimlik doğrulama ve Bcrypt ile şifreleme.
* **Responsive Tasarım:** Mobil, tablet ve masaüstü uyumlu arayüz.

---

## 🧠 Kullanılan Teknolojiler

| Alan | Araçlar |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS (SPA Router) |
| **Backend** | Node.js, Express.js |
| **Veritabanı** | SQLite3 |
| **Güvenlik** | bcrypt, express-session |
| **QR Engine** | `qrcode` npm package |

---

## 📁 Proje Yapısı

```text
QR_Generator_App/
├── server.js               # Express ana sunucu yapılandırması
├── package.json            # Proje bağımlılıkları
├── database/               # SQLite veritabanı (otomatik oluşur)
├── routes/                 # API Rotaları (Auth, QR, Admin)
├── middleware/             # Yetkilendirme (Auth & Admin)
└── public/                 # Frontend (HTML, CSS, SPA Router, Script)


## ⚙️ Kurulum

### 1. Repoyu Klonlayın
```bash
git clone [https://github.com/78Bilal/QR_Generator_App.git](https://github.com/78Bilal/QR_Generator_App.git)
cd QR_Generator_App

Anladım knk, kopyalarken Markdown formatı bozulmuş. Senin için her şeyi yerli yerine koydum, kullanıcı adını da verdiğin gibi 78Bilal olarak güncelledim.

Aşağıdaki bloğu sağ üstteki kopyalama butonuna basarak direkt README.md dosyasına yapıştırabilirsin:

Markdown
# 🚀 QR Generator App + Admin Paneli

![GitHub repo size](https://img.shields.io/github/repo-size/78Bilal/QR_Generator_App?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/78Bilal/QR_Generator_App?style=for-the-badge&color=blue)
![License](https://img.shields.io/github/license/78Bilal/QR_Generator_App?style=for-the-badge&color=green)

Modern, güvenli ve **Single Page Application (SPA)** mimarisiyle geliştirilmiş, tam kapsamlı bir QR Kod yönetim sistemidir.

---

## ⚙️ Kurulum

### 1. Repoyu Klonlayın
```bash
git clone [https://github.com/78Bilal/QR_Generator_App.git](https://github.com/78Bilal/QR_Generator_App.git)
cd QR_Generator_App

2. Bağımlılıkları Yükleyin
```bash
npm install

3. Uygulamayı Başlatın
```bash
node server.js

💡 Uygulama varsayılan olarak http://localhost:3000 adresinde çalışacaktır. SQLite veritabanı ilk çalıştırmada otomatik olarak oluşturulur.

🔒 Güvenlik
Bcrypt: Şifreler hashlenerek saklanır.

Session Auth: Güvenli oturum yönetimi ve httpOnly cookie.

RBAC: Rol tabanlı erişim kontrolü (Admin/User).

SQL Injection: Prepared statements koruması.

📱 Uyumluluk
✅ Chrome / Firefox / Edge / Safari

✅ Mobil & Tablet Uyumlu (Responsive)

✅ Windows / macOS / Linux

🤝 Katkıda Bulunma
Repoyu Fork'layın.

Branch açın (git checkout -b feature/yeniOzellik).

Commit yapın (git commit -m 'Eklendi: Özellik').

Push edin (git push origin feature/yeniOzellik).

Pull Request açın.

Geliştirici: Muhammed Bilal

Tarih: Ocak 2026 | Versiyon: 1.0.0 | Lisans: MIT
