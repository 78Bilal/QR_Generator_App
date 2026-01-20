// Admin Routes - Admin paneli için rotalar

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const adminMiddleware = require('../middleware/adminMiddleware');

// SQLite3 veritabanını aç
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'db.sqlite'));

// Tüm Kullanıcıları Al
// GET /api/admin/users
// Admin middleware ile korumalı
router.get('/users', adminMiddleware, (req, res) => {
  try {
    db.all(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC',
      (err, rows) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        res.json({ 
          success: true,
          data: rows 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ 
      error: 'Kullanıcı listesi hatası: ' + error.message 
    });
  }
});

// İstatistikler Al (Toplam Kullanıcı ve QR)
// GET /api/admin/stats
// Admin middleware ile korumalı
router.get('/stats', adminMiddleware, (req, res) => {
  try {
    // Toplam kullanıcı sayısı
    db.get('SELECT COUNT(*) as count FROM users', (err, userCount) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Veritabanı hatası: ' + err.message 
        });
      }

      // Toplam QR kod sayısı
      db.get('SELECT COUNT(*) as count FROM qrcodes', (err, qrCount) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        res.json({ 
          success: true,
          data: {
            totalUsers: userCount.count,
            totalQRCodes: qrCount.count
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'İstatistik hatası: ' + error.message 
    });
  }
});

// Kullanıcı Detayı Al
// GET /api/admin/user/:id
// Admin middleware ile korumalı
router.get('/user/:id', adminMiddleware, (req, res) => {
  try {
    const userId = req.params.id;

    // Kullanıcı bilgisini al
    db.get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veritabanı hatası: ' + err.message 
          });
        }

        if (!user) {
          return res.status(404).json({ 
            error: 'Kullanıcı bulunamadı' 
          });
        }

        // Kullanıcının QR kodlarını al
        db.all(
          'SELECT id, qr_data, qr_image, created_at FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC',
          [userId],
          (err, qrcodes) => {
            if (err) {
              return res.status(500).json({ 
                error: 'Veritabanı hatası: ' + err.message 
              });
            }

            res.json({ 
              success: true,
              data: {
                user: user,
                qrcodes: qrcodes || []
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ 
      error: 'Kullanıcı detay hatası: ' + error.message 
    });
  }
});

module.exports = router;
