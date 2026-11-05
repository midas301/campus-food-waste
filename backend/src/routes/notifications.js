import { Router } from 'express';
import { mdb } from '../mongo.js';
import { auth } from '../middleware/auth.js';

const r = Router();
const col = () => mdb.collection('notifications');

r.get('/', auth(), async (req, res) => {
  const docs = await col()
    .find({ user_id: req.user.user_id })
    .sort({ created_at: -1 })
    .limit(20)
    .toArray();
  res.json(docs);
});

r.patch('/read', auth(), async (req, res) => {
  await col().updateMany(
    { user_id: req.user.user_id, read: false },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});

export default r;