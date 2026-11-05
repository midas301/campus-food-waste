import cron from 'node-cron';
import { pool } from '../db.js';
import { SNAPSHOT_SQL, logWaste } from '../waste.js';
import { notify } from '../notify.js';

// Runs every minute: marks expired food and writes a waste log to MongoDB
cron.schedule('* * * * *', async () => {
  try {
    const [rows] = await pool.query(
      SNAPSHOT_SQL +
        " WHERE f.expiry_time < NOW() AND f.status IN ('Available','Reserved')"
    );
    for (const f of rows) {
      if (f.quantity > 0) await logWaste(f, f.quantity, 'Expired', true);
      await pool.query("UPDATE food_item SET status = 'Expired' WHERE food_id = ?", [f.food_id]);
      await notify(f.provider_id, `${f.food_name} expired; ${f.quantity} logged as waste`);
    }
  } catch (e) {
    console.error('expiry job failed', e.message);
  }
});