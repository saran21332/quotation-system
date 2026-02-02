require('dotenv').config(); // โหลด .env

console.log('JWT_SECRET:', process.env.JWT_SECRET); // เพิ่มบรรทัดนี้ดูว่าแสดงอะไร

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

async function createUser({ username, password, role }) {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'productpnc'
    });

    const [rows] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      console.log(`Username "${username}" นี้ถูกใช้ไปแล้ว`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
    await connection.execute(sql, [username, hashedPassword, role]);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = jwt.sign({ username, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('User created.');
    console.log('JWT Token:', token);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createUser({
  username: 'Siriwan',
  password: '1234',
  role: 'user'
});