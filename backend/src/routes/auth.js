import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const r = Router();

r.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!['Provider', 'Recipient'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [x] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)',
      [name, email, phone, hash, role]
    );
    res.status(201).json({ user_id: x.insertId });
  } catch (e) {
    res.status(400).json({
      error: e.code === 'ER_DUP_ENTRY' ? 'Email already registered' : e.message,
    });
  }
});

r.post('/login', async (req, res) => {
  const [[u]] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
  if (!u || !(await bcrypt.compare(req.body.password, u.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { user_id: u.user_id, role: u.role, name: u.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { user_id: u.user_id, name: u.name, role: u.role } });
});

export default r;