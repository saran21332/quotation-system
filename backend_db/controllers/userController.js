const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dayjs = require('dayjs');

exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }
  try {
    const [existingUser] = await db.query(
      `SELECT id FROM users WHERE username = ? LIMIT 1`,
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const insertSql = `
      INSERT INTO users (username, password_hash, role, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    await db.query(insertSql, [username, password_hash, role]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter username/password' });
  }
  try {
    const [results] = await db.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, [username]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'username not found' });
    }
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'password Incorrect' });
    }

    const isTempUser = user.is_temp_user === 1 || user.is_temp_user === true;
    let sessionId = null;

    if (isTempUser) {
      sessionId = crypto.randomBytes(16).toString('hex');
      const ip = req.ip;
      const ua = req.headers['user-agent'];

      await db.execute(
        `INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent)
         VALUES (?, ?, ?, ?)`,
        [user.id, sessionId, ip, ua]
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        temp_user: isTempUser,
        ...(sessionId && { session_id: sessionId })
      },
      process.env.JWT_SECRET,
      {
        expiresIn: isTempUser ? '1hr' : (process.env.JWT_EXPIRE || '1d')
      }
    );

    res.status(200).json({
      message: 'Login suscess!',
      token,
      temp_user: isTempUser
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.requestOtp = async (req, res) => {
  const { email, name, phone } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter email' });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }


  if (name && phone) {
  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number.' });
    }
  }

  try {
    if (name && phone) {
      const [existingUser] = await db.execute(
        `SELECT id FROM users WHERE email = ?`,
        [email]
      );

      if (existingUser.length === 0) {
        await db.execute(
          `INSERT INTO users (username, phone, email, created_at) VALUES (?, ?, ?, NOW())`,
          [name, phone, email]
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss');

    await db.execute(
      `INSERT INTO otp_requests (email, otp_code, expires_at)
       VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    const otpToken = jwt.sign(
      {
        email,
        name
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    await transporter.sendMail({
      from: `"PNC System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your One-Time Password (OTP)',
      text: `Your OTP code is: ${otp}\n\nValid for 5 minutes.`,
    });
    return res.status(200).json({ message: 'OTP sent to your email', otp_token: otpToken });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};


exports.resendOtp = async (req, res) => {
  const { otp_token } = req.body;

  if (!otp_token) {
    return res.status(400).json({ message: 'OTP token ไม่ถูกส่งมา' });
  }

  const decoded = jwt.decode(otp_token);

  if (!decoded || !decoded.email) {
    return res.status(400).json({ message: 'OTP token ไม่ถูกต้องหรือไม่มีอีเมล' });
  }

  const email = decoded.email;

  try {
    await db.execute(`DELETE FROM otp_requests WHERE email = ?`, [email]);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss');
    await db.execute(
      `INSERT INTO otp_requests (email, otp_code, expires_at) VALUES (?, ?, ?)`,
      [email, otp, expiresAt]
    );

    const newOtpToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"PNC System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your new OTP code',
      text: `Your new OTP code is: ${otp}\n\nValid for 5 minutes.`,
    });

    return res.status(200).json({ message: 'ส่ง OTP ใหม่เรียบร้อยแล้ว', otp_token: newOtpToken });
  } catch (err) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดระหว่างส่ง OTP ใหม่' });
  }
};


exports.verifyOtp = async (req, res) => {
  const { otp_token, otp } = req.body;

  if (!otp_token || !otp) {
    return res.status(400).json({ message: 'Please enter OTP' });
  }

  try {
    const payload = jwt.verify(otp_token, process.env.JWT_SECRET);
    const email = payload.email;
    const name = payload.name;

    const [rows] = await db.execute(
      `SELECT * FROM otp_requests
       WHERE email = ? AND used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    const otpRecord = rows[0];

    if (!otpRecord) return res.status(400).json({ message: 'OTP not found or already used' });
    if (otpRecord.otp_code !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(otpRecord.expires_at)) return res.status(400).json({ message: 'OTP expired' });

    await db.execute(`UPDATE otp_requests SET used = TRUE WHERE id = ?`, [otpRecord.id]);

    const tempPassword = crypto.randomBytes(10).toString('base64');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const [existingUsers] = await db.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      await db.execute(
        `UPDATE users SET username = ?, password_hash = ?, role = ?, is_temp_user = ? WHERE id = ?`,
        [name, passwordHash, 'user', true, userId]
      );
    } else {
      const [result] = await db.execute(
        `INSERT INTO users (email, username, password_hash, role, is_temp_user)
         VALUES (?, ?, ?, ?, ?)`,
        [email, name, passwordHash, 'user', true]
      );
      userId = result.insertId;
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const ip = req.ip;
    const ua = req.headers['user-agent'];

    await db.execute(
      `INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [userId, sessionId, ip, ua]
    );

    return res.json({
      message: 'OTP verified and temporary user created',
      username: name,
      password: tempPassword
    });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.session_id) {
      await db.execute(
        `UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?`,
        [decoded.session_id]
      );
    }

    return res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};