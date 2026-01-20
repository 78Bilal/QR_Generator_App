// Oturum kontrol middleware'i
// Bu middleware, korunan rotaları kontrol etmek için kullanılır

const authMiddleware = (req, res, next) => {
  // Session'da userId var mı kontrol et
  if (req.session && req.session.userId) {
    // Giriş yapmış kullanıcı, sonraki adıma geç
    next();
  } else {
    // Giriş yapmamış kullanıcı, 401 hatası döndür
    res.status(401).json({ error: 'Yetkilendirme gereklidir. Lütfen giriş yapınız.' });
  }
};

module.exports = authMiddleware;
