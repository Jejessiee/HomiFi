const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Ambil token dari cookies ATAU dari header Authorization (Bearer token)
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    // 2. Jika tidak ada token sama sekali
    if (!token) {
      return res
        .status(401)
        .send({ message: "Akses ditolak. Silakan login terlebih dahulu.", success: false });
    }

    // 3. Gunakan JWT_SECRET (sesuai file .env) atau JWT_KEY sebagai cadangan
    const secretKey = process.env.JWT_SECRET || process.env.JWT_KEY;

    // 4. Verifikasi Token
    jwt.verify(token, secretKey, (err, decode) => {
      if (err) {
        return res
          .status(401) // Diubah dari 200 menjadi 401
          .send({ message: "Sesi telah habis atau token tidak valid", success: false });
      } else {
        req.body = req.body || {};
        req.body.userId = decode.id; // Menyisipkan ID user untuk digunakan oleh Controller
        next();
      }
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error); 
    res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  authMiddleware
};