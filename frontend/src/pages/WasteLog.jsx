import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

const REASONS = ['Spoiled', 'Overproduced', 'Not collected', 'Damaged', 'Other'];

export default function WasteLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ food_id: '', wasted_quantity: '', reason: 'Spoiled' });
  const [msg, setMsg] = useState('');

  const load = () =>
    api.get('/waste', { params: filter ? { reason: filter } : {} }).then((r) => setLogs(r.data));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/waste', {
        food_id: Number(form.food_id),
        wasted_quantity: Number(form.wasted_quantity),
        reason: form.reason,
      });
      setMsg('Waste recorded');
      setForm({ food_id: '', wasted_quantity: '', reason: 'Spoiled' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to record');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Waste log {user?.role === 'Admin' && '(all providers)'}</h2>
      {msg && <p><i>{msg}</i></p>}

      <h3>Record waste</h3>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input type="number" min="1" placeholder="Food ID" value={form.food_id} onChange={set('food_id')} required />
        <input type="number" min="1" placeholder="Wasted quantity" value={form.wasted_quantity} onChange={set('wasted_quantity')} required />
        <select value={form.reason} onChange={set('reason')}>
          {REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="submit">Record waste</button>
      </form>

      <h3>History</h3>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All reasons</option>
        {[...REASONS, 'Expired'].map((r) => <option key={r}>{r}</option>)}
      </select>
      <table cellPadding={6} style={{ borderCollapse: 'collapse', marginTop: 8 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Time</th><th>Food</th><th>Qty</th><th>Reason</th><th>Category</th><th>Location</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{new Date(l.recorded_time).toLocaleString()}</td>
              <td>{l.food_snapshot?.food_name} (#{l.food_id})</td>
              <td>{l.wasted_quantity}</td>
              <td>{l.reason}</td>
              <td>{l.food_snapshot?.category_name}</td>
              <td>{l.food_snapshot?.location_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p>No waste logged yet.</p>}
    </div>
  );
}