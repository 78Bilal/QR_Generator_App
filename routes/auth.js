// Kimlik doğrulama rotaları (Login, Register, Logout)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite3 veritabanını aç (mevcut bağlantıyı kullan)
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'db.sqlite'));

// Register (Kayıt) rotası
// POST /api/auth/register
// Body: { username, email, password, passwordConfirm }
router.post('/register', async (req, res) => {
  try {
    // İstek verilerini al
    const { username, email, password, passwordConfirm } = req.body;

    // Tüm alanlar doldurulmuş mu kontrol et
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({ 
        error: 'Lütfen tüm alanları doldurunuz' 
      });
    }

    // Şifreler eşleşiyor mu kontrol et
    if (password !== passwordConfirm) {
      return res.status(400).json({ 
        error: 'Şifreler eşleşmiyor' 
      });
    }

    // Minimum şifre uzunluğu kontrolü (en az 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Şifre en az 6 karakter olmalıdır' 
      });
    }

    // Veritabanında kullanıcı kontrolü
    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Veritabanı hatası: ' + err.message 
        });
      }

      // Email zaten kayıtlı mı kontrol et
      if (row) {
        return res.status(400).json({ 
          error: 'Bu email zaten kayıtlı' 
        });
      }

      // Şifreyi hashle (bcrypt ile)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Veritabanına yeni kullanıcıyı ekle
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        (err) => {
          if (err) {
            // Benzersiz kısıtlama ihlali (username zaten var)
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ 
                error: 'Bu kullanıcı adı zaten alınmış' 
              });
            }
            return res.status(500).json({ 
              error: 'Kayıt sırasında hata: ' + err.message 
            });
          }

          // Başarılı kayıt
          return res.status(201).json({ 
            success: true,
            message: 'Kayıt başarıyla tamamlandı. Lütfen giriş yapınız.' 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Sunucu hatası: ' + error.message 
    });
  }
});

// Login (Giriş) rotası
// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  try {
    // İstek verilerini al
    const { email, password } = req.body;

    // Tüm alanlar doldurulmuş mu kontrol et
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email ve şifre gereklidir' 
      });
    }

    // Veritabanında kullanıcıyı ara
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Veritabanı hatası: ' + err.message 
        });
      }

      // Kullanıcı bulunamadı
      if (!user) {
        return res.status(401).json({ 
          error: 'Email veya şifre hatalı' 
        });
      }

      // Şifre kontrol et (bcrypt ile)
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ 
          error: 'Email veya şifre hatalı' 
        });
      }

      // Şifre doğru, session oluştur
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      };

      return res.status(200).json({ 
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user'
        }
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Sunucu hatası: ' + error.message 
    });
  }
});

// Logout (Çıkış) rotası
// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Session'ı yok et
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Çıkış sırasında hata' 
      });
    }

    // Başarılı çıkış
    return res.status(200).json({ 
      success: true,
      message: 'Başarıyla çıkış yaptınız' 
    });
  });
});

// Oturum bilgisi kontrolü rotası
// GET /api/auth/check
// Mevcut kullanıcı bilgisini döndür
router.get('/check', (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        email: req.session.user.email,
        role: req.session.user.role
      }
    });
  } else if (req.session && req.session.userId) {
    // Eski formatı destekle (geriye uyumluluk)
    res.status(200).json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: 'user'
      }
    });
  } else {
    res.status(200).json({
      authenticated: false
    });
  }
});

// Hesap silme rotası
// DELETE /api/auth/delete-account
// Kullanıcı hesabını ve tüm verilerini sil
router.delete('/delete-account', (req, res) => {
  try {
    // Oturum kontrolü
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        error: 'Yetkilendirme gereklidir' 
      });
    }

    const userId = req.session.userId;

    // Önce kullanıcının QR kodlarını sil (cascade olabilir ama emin olmak için)
    db.run(
      'DELETE FROM qrcodes WHERE user_id = ?',
      [userId],
      (err) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Veri silinirken hata: ' + err.message 
          });
        }

        // Ardından kullanıcıyı sil
        db.run(
          'DELETE FROM users WHERE id = ?',
          [userId],
          (err) => {
            if (err) {
              return res.status(500).json({ 
                error: 'Hesap silinirken hata: ' + err.message 
              });
            }

            // Session'ı yok et
            req.session.destroy((err) => {
              return res.status(200).json({
                success: true,
                message: 'Hesabınız ve tüm verileriniz başarıyla silindi'
              });
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

// Şifre Değiştir rotası
// POST /api/auth/change-password
// Body: { currentPassword, newPassword, newPasswordConfirm }
router.post('/change-password', async (req, res) => {
  try {
    // İstek verilerini al
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // Session kontrolü - kullanıcı giriş yaptı mı
    if (!req.session.user) {
      return res.status(401).json({ 
        error: 'Giriş yapmanız gerekir' 
      });
    }

    // Tüm alanlar doldurulmuş mu kontrol et
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({ 
        error: 'Lütfen tüm alanları doldurunuz' 
      });
    }

    // Yeni şifreler eşleşiyor mu kontrol et
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ 
        error: 'Yeni şifreler eşleşmiyor' 
      });
    }

    // Minimum şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Yeni şifre en az 6 karakter olmalıdır' 
      });
    }

    // Mevcut şifreyi kontrol et
    db.get('SELECT password FROM users WHERE id = ?', [req.session.user.id], async (err, row) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Veritabanı hatası: ' + err.message 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          error: 'Kullanıcı bulunamadı' 
        });
      }

      // Mevcut şifre doğru mu kontrol et
      const passwordMatch = await bcrypt.compare(currentPassword, row.password);

      if (!passwordMatch) {
        return res.status(400).json({ 
          error: 'Mevcut şifre yanlış' 
        });
      }

      // Yeni şifreyi hashle
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Şifreyi güncelle
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.session.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ 
              error: 'Şifre değiştirme hatası: ' + err.message 
            });
          }

          res.json({ 
            success: true,
            message: 'Şifre başarıyla değiştirildi' 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Şifre değiştirme işlemi hatası: ' + error.message 
    });
  }
});

// Hesap Sil rotası
// POST /api/auth/delete-account
// Session üzerinden kullanıcıyı doğrula
router.post('/delete-account', async (req, res) => {
  try {
    // Session kontrolü
    if (!req.session.user) {
      return res.status(401).json({ 
        error: 'Giriş yapmanız gerekir' 
      });
    }

    const userId = req.session.user.id;

    // Önce QR kodlarını sil
    db.run('DELETE FROM qrcodes WHERE user_id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ 
          error: 'QR kodları silme hatası: ' + err.message 
        });
      }

      // Sonra kullanıcıyı sil
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
          return res.status(500).json({ 
            error: 'Hesap silme hatası: ' + err.message 
          });
        }

        // Session'ı sonlandır
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ 
              error: 'Session sonlandırma hatası: ' + err.message 
            });
          }

          res.json({ 
            success: true,
            message: 'Hesap başarıyla silindi',
            redirect: '/login.html'
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Hesap silme işlemi hatası: ' + error.message 
    });
  }
});

module.exports = router;
