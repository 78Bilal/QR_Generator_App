// ================================
// GEREKLİ PAKETLER
// ================================
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcrypt")

// ================================
// EXPRESS APP
// ================================
const app = express()
const PORT = process.env.PORT || 3000

// ================================
// MIDDLEWARE
// ================================
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// ================================
// SESSION
// ================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS olunca true
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
)

// ================================
// SQLITE DB
// ================================
const db = new sqlite3.Database(
  path.join(__dirname, "database", "db.sqlite"),
  err => {
    if (err) {
      console.error("❌ DB Hatası:", err.message)
    } else {
      console.log("✅ SQLite bağlandı")
      initializeDatabase()
    }
  }
)

// ================================
// DB INIT
// ================================
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS qrcodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      qr_data TEXT NOT NULL,
      qr_image TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Admin kullanıcı (yoksa oluştur)
  db.get(
    "SELECT id FROM users WHERE email = ?",
    ["admin@example.com"],
    (err, row) => {
      if (!row) {
        const hashed = bcrypt.hashSync("admin123", 10)
        db.run(
          "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
          ["admin", "admin@example.com", hashed, "admin"],
          () => console.log("✅ Admin hesabı oluşturuldu")
        )
      }
    }
  )

  console.log("✅ DB tabloları hazır")
}

// ================================
// ROUTES
// ================================
app.use("/api/auth", require("./routes/auth"))
app.use("/api/qr", require("./routes/qr"))
app.use("/api/admin", require("./routes/admin"))

// ================================
// SPA FALLBACK (EN KRİTİK KISIM)
// ================================
// /
// /login
// /register
// /dashboard
// /admin
// refresh → BOZULMAZ
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ================================
// SERVER START
// ================================
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor → http://localhost:${PORT}`)
})

// ================================
// GRACEFUL SHUTDOWN
// ================================
process.on("SIGINT", () => {
  db.close(() => {
    console.log("🛑 DB kapatıldı")
    process.exit(0)
  })
})

// ================================
// EXPORTS
// ================================
module.exports = { app, db }
