import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../middleware/auth.js';
import { notify } from '../notify.js';
const r = Router();

async function ownsRequest(req, res, next) {
  const [[row]] = await pool.query(
    `SELECT r.recipient_id FROM request r JOIN food_item f USING(food_id)
     WHERE r.request_id=? AND f.provider_id=?`, [req.params.id, req.user.user_id]);
  if (!row) return res.status(403).json({ error: 'Not your request' });
  req.recipient_id = row.recipient_id;
  next();
}

r.post('/', auth(['Recipient']), async (req, res) => {
  const { food_id, requested_quantity } = req.body;
  const [[f]] = await pool.query(
    "SELECT quantity, provider_id FROM food_item WHERE food_id=? AND status='Available'", [food_id]);
  if (!f || f.quantity < requested_quantity)
    return res.status(400).json({ error: 'Not enough quantity available' });
  const [x] = await pool.query(
    'INSERT INTO request (requested_quantity,recipient_id,food_id) VALUES (?,?,?)',
    [requested_quantity, req.user.user_id, food_id]);
  await notify(f.provider_id, `New request for food #${food_id}`);
  res.status(201).json({ request_id: x.insertId });
});

r.get('/mine', auth(['Recipient']), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, f.food_name, f.unit FROM request r JOIN food_item f USING(food_id)
     WHERE r.recipient_id=? ORDER BY r.request_id DESC`, [req.user.user_id]);
  res.json(rows);
});

r.get('/incoming', auth(['Provider']), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, f.food_name, f.unit, u.name AS recipient_name
     FROM request r JOIN food_item f USING(food_id) JOIN users u ON u.user_id=r.recipient_id
     WHERE f.provider_id=? ORDER BY r.request_id DESC`, [req.user.user_id]);
  res.json(rows);
});

r.patch('/:id/approve', auth(['Provider']), ownsRequest, async (req, res) => {
  try {
    await pool.query('CALL approve_request(?)', [req.params.id]);
    await notify(req.recipient_id, `Your request #${req.params.id} was approved`);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.sqlMessage || e.message }); }
});

r.patch('/:id/reject', auth(['Provider']), ownsRequest, async (req, res) => {
  await pool.query("UPDATE request SET status='Rejected' WHERE request_id=? AND status='Pending'", [req.params.id]);
  await notify(req.recipient_id, `Your request #${req.params.id} was rejected`);
  res.json({ ok: true });
});

r.post('/:id/distribute', auth(['Provider']), ownsRequest, async (req, res) => {
  try {
    await pool.query('CALL distribute_request(?,?)', [req.params.id, req.body.collected_by || 'Recipient']);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.sqlMessage || e.message }); }
});

export default r;