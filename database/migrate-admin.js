// Admin Paneli İçin Veritabanı Migration

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'), async (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
    process.exit(1);
  }

  console.log('✓ Veritabanı bağlantısı sağlandı');

  try {
    // Role kolonu var mı kontrol et
    db.all("PRAGMA table_info(users)", (err, columns) => {
      const hasRole = columns.some(col => col.name === 'role');

      if (!hasRole) {
        // Role kolonu ekle
        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
          if (err) {
            console.error('Role kolonu ekleme hatası:', err.message);
          } else {
            console.log('✓ Role kolonu başarıyla eklendi');
          }

          // Admin kullanıcı oluştur
          createAdminUser();
        });
      } else {
        console.log('✓ Role kolonu zaten mevcut');
        createAdminUser();
      }
    });
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
});

// Admin kullanıcı oluştur
async function createAdminUser() {
  try {
    // Admin kullanıcısı var mı kontrol et
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], async (err, row) => {
      if (err) {
        console.error('Admin kontrol hatası:', err.message);
        db.close();
        return;
      }

      if (row) {
        // Zaten var, sadece admin yap
        db.run('UPDATE users SET role = ? WHERE username = ?', ['admin', 'admin'], (err) => {
          if (err) {
            console.error('Admin güncelleme hatası:', err.message);
          } else {
            console.log('✓ Admin kullanıcısı role güncellendi');
          }
          
          db.close();
          console.log('\n✓ Migration tamamlandı!');
          console.log('\nAdmin giriş bilgileri:');
          console.log('  Email: admin@example.com');
          console.log('  Şifre: admin123');
        });
      } else {
        // Yeni admin oluştur
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          ['admin', 'admin@example.com', hashedPassword, 'admin'],
          (err) => {
            if (err) {
              console.error('Admin oluşturma hatası:', err.message);
            } else {
              console.log('✓ Admin kullanıcısı başarıyla oluşturuldu');
            }
            
            db.close();
            console.log('\n✓ Migration tamamlandı!');
            console.log('\nAdmin giriş bilgileri:');
            console.log('  Email: admin@example.com');
            console.log('  Şifre: admin123');
          }
        );
      }
    });
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    db.close();
  }
}
