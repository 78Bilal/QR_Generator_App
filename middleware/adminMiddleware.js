// Admin Middleware - Admin rolü kontrolü

// Admin middleware
const adminMiddleware = (req, res, next) => {
  // Session kontrolü
  if (!req.session.user) {
    return res.status(401).json({ 
      error: 'Giriş yapmanız gerekir' 
    });
  }

  // Admin rolü kontrolü
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Bu sayfaya erişim izniniz yok' 
    });
  }

  next();
};

module.exports = adminMiddleware;
