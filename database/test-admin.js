// Test script - Admin Panel Debug

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'database', 'db.sqlite'));

console.log('=== ADMIN PANEL TEST ===\n');

// 1. Kullanıcıları listele
console.log('1. Veritabanındaki Kullanıcılar:');
db.all('SELECT id, username, email, role FROM users', (err, users) => {
  if (err) {
    console.error('Hata:', err);
  } else {
    console.log(JSON.stringify(users, null, 2));
  }

  // 2. Admin var mı kontrol et
  console.log('\n2. Admin Kontrol:');
  db.get('SELECT * FROM users WHERE role = ?', ['admin'], (err, admin) => {
    if (err) {
      console.error('Hata:', err);
    } else if (admin) {
      console.log('✓ Admin kullanıcısı var');
      console.log('  Username:', admin.username);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
    } else {
      console.log('✗ Admin kullanıcısı bulunamadı');
    }

    // 3. QR sayısı kontrol et
    console.log('\n3. QR Kod Sayısı:');
    db.get('SELECT COUNT(*) as count FROM qrcodes', (err, result) => {
      if (err) {
        console.error('Hata:', err);
      } else {
        console.log('  Total QR Codes:', result.count);
      }

      // 4. Veritabanı schema kontrol
      console.log('\n4. Users Tablosu Columns:');
      db.all("PRAGMA table_info(users)", (err, columns) => {
        if (err) {
          console.error('Hata:', err);
        } else {
          console.log(JSON.stringify(columns, null, 2));
        }
        
        db.close();
        console.log('\n✓ Test tamamlandı');
      });
    });
  });
});
