# 🚀 QR Kod Oluşturucu - Hızlı Başlangıç Rehberi

## Adım 1: Kurulum

Proje klasörüne gidin ve paketleri yükleyin:

```bash
cd d:\QR-Code_Generator
npm install
```

Bu komut tüm gerekli paketleri (Express, SQLite3, bcrypt, qrcode, vb.) yükleyecektir.

## Adım 2: Sunucuyu Başlatın

```bash
node server.js
```

Başarılı başlatma sonrası şu mesajları görmelisiniz:
```
🚀 QR Kod Oluşturucu sunucusu http://localhost:3000 adresinde çalışıyor
✓ SQLite veritabanına bağlandı
✓ Veritabanı tabloları hazırlandı
```

## Adım 3: Web Arayüzünü Açın

Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

## 📝 İlk Kullanım Adımları

### 1. Kayıt Ol
- Ana sayfan otomatik olarak login sayfasına yönlendirilecektir
- "Kayıt ol" linkine tıklayın
- Kullanıcı adı, email ve şifre ile kayıt yapın
- En az 6 karakterli şifre gereklidir

### 2. Giriş Yapın
- Kayıt sırasında verdiğiniz email ve şifre ile giriş yapın

### 3. QR Kod Oluşturun
- Dashboard'ta "Yeni QR Kod Oluştur" bölümünü bulun
- QR kodu için veri girin (URL, metin, telefon numarası, vb.)
- "QR Kod Oluştur" butonu ile QR kodunu oluşturun

### 4. QR Kodunu İndirin veya Yönetin
- Oluşturulan QR kodu "İndir" butonu ile indirebilirsiniz
- Tüm oluşturduğunuz QR kodları "QR Kod Geçmişi" bölümünde görebilirsiniz
- Geçmişten QR kodları silebilirsiniz

## 🔧 Sunucu Komutları

### Sunucuyu Normal Modda Başlat
```bash
node server.js
```

### Sunucuyu Farklı Port'ta Başlat
```bash
PORT=3001 node server.js
```

### Sunucuyu Durdur
Terminal penceresinde `Ctrl+C` tuşlarına basın

## 📊 Veritabanı Bilgileri

Veritabanı otomatik olarak oluşturulur: `database/db.sqlite`

### Tabloları Sıfırlamak İçin (Tüm Veriler Silinir)

```bash
# Sunucuyu durdurun (Ctrl+C)
# Veritabanı dosyasını silin
rm database/db.sqlite
# Sunucuyu yeniden başlatın
node server.js
```

## ✅ Kontrol Listesi

- [x] Node.js yüklü mü?
- [x] `npm install` çalıştırıldı mı?
- [x] `node server.js` başlatıldı mı?
- [x] Browser'ı `http://localhost:3000` açıldı mı?
- [x] Kayıt, Giriş, QR Oluşturma işlemleri başarılı mı?

## 🐛 Sorun Giderme

### "Port 3000 zaten kullanılıyor" Hatası

```bash
# Farklı port kullanın
PORT=3001 node server.js
```

### "Cannot find module" Hatası

```bash
# Paketleri yeniden yükle
rm -r node_modules package-lock.json
npm install
```

### Veritabanı Hatası

```bash
# Veritabanını sıfırla
rm database/db.sqlite
node server.js
```

## 📱 Özellikler Özeti

✨ **Kimlik Doğrulama**
- Güvenli şifre hashleme (bcrypt)
- Session tabanlı oturum yönetimi

🔐 **Veri Güvenliği**
- Kullanıcılar sadece kendi QR kodlarını görebilir
- SQL injection koruması
- XSS koruması

📊 **QR Kod Yönetimi**
- Sınırsız QR kod oluşturma
- QR kodlarını indir
- Geçmiş silme işlemleri
- Tarih bilgisi ile geçmiş

🎨 **Arayüz**
- Modern, responsive tasarım
- Mobil uyumlu
- Gradient tema
- Smooth animasyonlar

## 📞 Bilgi

- **Node Versiyonu**: 14.0 veya üstü
- **NPM Versiyonu**: 6.0 veya üstü

---

**Kamu Sürümü**: 1.0.0
**Son Güncelleme**: Ocak 2026
