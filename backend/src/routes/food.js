import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../middleware/auth.js';

const r = Router();

r.get('/meta', auth(), async (req, res) => {
  const [categories] = await pool.query('SELECT * FROM category');
  const [locations] = await pool.query('SELECT * FROM location');
  res.json({ categories, locations });
});

r.get('/', auth(), async (req, res) => {
  const { category_id, location_id } = req.query;
  let sql = 'SELECT * FROM v_available_food WHERE 1=1';
  const p = [];
  if (category_id) { sql += ' AND category_id = ?'; p.push(category_id); }
  if (location_id) { sql += ' AND location_id = ?'; p.push(location_id); }
  const [rows] = await pool.query(sql + ' ORDER BY expiry_time', p);
  res.json(rows);
});

r.get('/mine', auth(['Provider']), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM food_item WHERE provider_id = ? ORDER BY food_id DESC',
    [req.user.user_id]
  );
  res.json(rows);
});

r.post('/', auth(['Provider']), async (req, res) => {
  const { food_name, quantity, unit, prepared_time, expiry_time, category_id, location_id } = req.body;
  try {
    const [x] = await pool.query(
      `INSERT INTO food_item
        (food_name, quantity, unit, prepared_time, expiry_time, provider_id, category_id, location_id)
       VALUES (?,?,?,?,?,?,?,?)`,
      [food_name, quantity, unit, prepared_time, expiry_time, req.user.user_id, category_id, location_id]
    );
    res.status(201).json({ food_id: x.insertId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

r.delete('/:id', auth(['Provider']), async (req, res) => {
  try {
    const [x] = await pool.query(
      'DELETE FROM food_item WHERE food_id = ? AND provider_id = ?',
      [req.params.id, req.user.user_id]
    );
    res.json({ deleted: x.affectedRows });
  } catch {
    res.status(400).json({ error: 'Cannot delete an item that has requests' });
  }
});

export default r;