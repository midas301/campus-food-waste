import crypto from 'crypto';
import { mdb } from './mongo.js';

export const SNAPSHOT_SQL = `SELECT f.food_id, f.food_name, f.quantity, f.provider_id,
  c.category_name, l.location_name, l.building
  FROM food_item f
  JOIN category c USING (category_id)
  JOIN location l USING (location_id)`;

export function logWaste(f, qty, reason, once = false) {
  const col = mdb.collection('waste_logs');
  const rest = {
    wasted_quantity: Number(qty),
    recorded_time: new Date(),
    food_snapshot: {
      food_name: f.food_name,
      category_name: f.category_name,
      location_name: f.location_name,
      building: f.building,
      provider_id: f.provider_id,
    },
  };
  if (once) {
    // idempotent: only one 'Expired' log per food item
    return col.updateOne(
      { food_id: f.food_id, reason },
      { $setOnInsert: { waste_id: crypto.randomUUID(), ...rest } },
      { upsert: true }
    );
  }
  return col.insertOne({ waste_id: crypto.randomUUID(), food_id: f.food_id, reason, ...rest });
}