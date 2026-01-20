// QR Kod oluşturma ve yönetme rotaları

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const authMiddleware = require('../middleware/authMiddleware');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite3 veritabanını aç (mevcut bağlantıyı kullan)
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'db.sqlite'));

// QR Kod oluştur - GİRİŞ YAPMAYAN KULLANICILAR DA OLUŞTURABILECEK
// POST /api/qr/generate
// Body: { data }
// Eğer session varsa DB'ye kaydet, yoksa sadece QR oluştur
router.post('/generate', async (req, res) => {
  try {
    // İstek verilerini al
    const { data } = req.body;
    const userId = req.session?.userId; // Session varsa userId al, yoksa undefined

    // Data boş mu kontrol et
    if (!data || data.trim() === '') {
      return res.status(400).json({ 
        error: 'QR kodu için veri gereklidir' 
      });
    }

    // QR kod generate et
    const qrImage = await QRCode.toDataURL(data);

    // Eğer userId varsa (kullanıcı giriş yapmışsa) DB'ye kaydet
    if (userId) {
      // Üyeli kullanıcı - QR kodunu veritabanına kaydet
      db.run(
        'INSERT INTO qrcodes (user_id, qr_data, qr_image) VALUES (?, ?, ?)',
        [userId, data, qrImage],
        function(err) {
          if (err) {
            return res.status(500).json({ 
              error: 'QR kod kaydı sırasında hata: ' + err.message 
            });
          }

          // Başarılı - oluşturulan QR kodunu döndür
          return res.status(201).json({
            success: true,
            message: 'QR kod başarıyla oluşturuldu ve kaydedildi',
            qr: {
              id: this.lastID, // Oluşturulan kaydın ID'si
              data: data,
              image: qrImage,
              created_at: new Date()
            }
          });
        }
      );
    } else {
      // Üyesiz kullanıcı - Sadece QR kod oluştur, DB'ye kaydetme
      return res.status(201).json({
        success: true,
        message: 'QR kod başarıyla oluşturuldu',
        qr: {
          id: Date.now(), // Geçici ID (tarayıcıda kullanılacak)
          data: data,
          image: qrImage,
          created_at: new Date()
        }
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'QR kod oluşturma hatası: ' + error.message 
    });
  }
});

// Kullanıcının tüm QR kodlarını getir
// GET /api/qr/history
// Header: Authorization gerektirir (session kontrol)
router.get('/history', authMiddleware, (req, res) => {
  try {
    const userId = req.session.userId;

    // Veritabanından kullanıcının QR kodlarını getir (en yeni önce)
    db.all(
      'SELECT id, qr_data, qr_image, created_at FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        // Başarılı - QR kodları döndür
        return res.status(200).json({
          success: true,
          count: rows ? rows.length : 0,
          qrcodes: rows || []
        });
      }
    );
  } catch (error) {
    res.status(500).json({ 
      error: 'Veri çekme hatası: ' + error.message 
    });
  }
});

// Belirli bir QR kodunu getir
// GET /api/qr/:id
// Header: Authorization gerektirir (session kontrol)
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const qrId = req.params.id;
    const userId = req.session.userId;

    // Veritabanından QR kodunu getir (ve kullanıcı kontrolü yap)
    db.get(
      'SELECT id, qr_data, qr_image, created_at FROM qrcodes WHERE id = ? AND user_id = ?',
      [qrId, userId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        // QR kod bulunamadı veya kullanıcı sahibi değil
        if (!row) {
          return res.status(404).json({ 
            error: 'QR kod bulunamadı' 
          });
        }

        // Başarılı - QR kodunu döndür
        return res.status(200).json({
          success: true,
          qr: row
        });
      }
    );
  } catch (error) {
    res.status(500).json({ 
      error: 'Veri çekme hatası: ' + error.message 
    });
  }
});

// QR kodunu sil
// DELETE /api/qr/:id
// Header: Authorization gerektirir (session kontrol)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const qrId = req.params.id;
    const userId = req.session.userId;

    // Önce QR kodun kullanıcıya ait olup olmadığını kontrol et
    db.get(
      'SELECT id FROM qrcodes WHERE id = ? AND user_id = ?',
      [qrId, userId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        // QR kod bulunamadı veya kullanıcı sahibi değil
        if (!row) {
          return res.status(404).json({ 
            error: 'QR kod bulunamadı' 
          });
        }

        // QR kodunu sil
        db.run(
          'DELETE FROM qrcodes WHERE id = ?',
          [qrId],
          (err) => {
            if (err) {
              return res.status(500).json({ 
                error: 'Silme işlemi sırasında hata: ' + err.message 
              });
            }

            return res.status(200).json({
              success: true,
              message: 'QR kod başarıyla silindi'
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ 
      error: 'Silme işlemi hatası: ' + error.message 
    });
  }
});

module.exports = router;
