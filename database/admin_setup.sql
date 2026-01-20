-- Admin Kullanıcı Oluşturma Script'i
-- Bunu SQLite3 veritabanında çalıştırın

-- Not: Mevcut bir kullanıcıyı admin yapmak için:
UPDATE users SET role = 'admin' WHERE username = 'admin_username';

-- Veya yeni bir admin kullanıcı oluşturmak için (bcrypt şifreli):
-- Şifre: 'admin123' (bcrypt ile hashlenmişi)
INSERT OR IGNORE INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2b$10$ABC...DEF...', 'admin');

-- Mevcut tüm kullanıcıları görmek için:
SELECT id, username, email, role, created_at FROM users;

-- Kullanıcı role'ünü kontrol etmek için:
SELECT id, username, role FROM users;
