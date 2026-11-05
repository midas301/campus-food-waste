import { Router } from 'express';
import { pool } from '../db.js';
import { mdb } from '../mongo.js';
import { auth } from '../middleware/auth.js';
import { SNAPSHOT_SQL, logWaste } from '../waste.js';

const r = Router();

r.post('/', auth(['Provider', 'Admin']), async (req, res) => {
  const { food_id, wasted_quantity, reason } = req.body;
  const [[f]] = await pool.query(SNAPSHOT_SQL + ' WHERE f.food_id = ?', [food_id]);
  if (!f) return res.status(404).json({ error: 'Food item not found' });
  if (req.user.role === 'Provider' && f.provider_id !== req.user.user_id) {
    return res.status(403).json({ error: 'Not your item' });
  }
  await logWaste(f, wasted_quantity, reason);
  res.status(201).json({ ok: true });
});

r.get('/', auth(['Provider', 'Admin']), async (req, res) => {
  const q = {};
  if (req.query.reason) q.reason = req.query.reason;
  if (req.user.role === 'Provider') q['food_snapshot.provider_id'] = req.user.user_id;
  const docs = await mdb
    .collection('waste_logs')
    .find(q)
    .sort({ recorded_time: -1 })
    .limit(200)
    .toArray();
  res.json(docs);
});

export default r;