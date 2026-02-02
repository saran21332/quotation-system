const jwt = require('jsonwebtoken');
const db = require('../db');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.session_id) {
      const [rows] = await db.execute(
        `SELECT * FROM user_sessions
         WHERE session_id = ? AND is_active = TRUE LIMIT 1`,
        [decoded.session_id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Session expired or invalid' });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};