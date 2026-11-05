import { Router } from 'express';
import { pool } from '../db.js';
import { mdb } from '../mongo.js';
import { auth } from '../middleware/auth.js';

const r = Router();
const col = () => mdb.collection('waste_logs');

const group = (key) =>
  col()
    .aggregate([
      { $group: { _id: key, total: { $sum: '$wasted_quantity' } } },
      { $sort: { total: -1 } },
    ])
    .toArray();

const metrics = {
  'by-reason': () => group('$reason'),
  'by-category': () => group('$food_snapshot.category_name'),
  'by-location': () => group('$food_snapshot.location_name'),
  weekly: () =>
    col()
      .aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%G-W%V', date: '$recorded_time' } },
            total: { $sum: '$wasted_quantity' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
  summary: async () => {
    const [[d]] = await pool.query(
      'SELECT COALESCE(SUM(quantity_distributed), 0) AS distributed FROM distribution'
    );
    const [w] = await col()
      .aggregate([{ $group: { _id: null, wasted: { $sum: '$wasted_quantity' } } }])
      .toArray();
    return { distributed: Number(d.distributed), wasted: w?.wasted || 0 };
  },
};

r.get('/:metric', auth(['Admin']), async (req, res) => {
  const fn = metrics[req.params.metric];
  if (!fn) return res.status(404).json({ error: 'Unknown metric' });
  res.json(await fn());
});

export default r;