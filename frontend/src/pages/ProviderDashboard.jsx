import { useEffect, useState } from 'react';
import api from '../api';

const toSql = (v) => (v ? v.replace('T', ' ') + ':00' : '');

const empty = {
  food_name: '',
  quantity: '',
  unit: 'plates',
  prepared_time: '',
  expiry_time: '',
  category_id: '',
  location_id: '',
};

export default function ProviderDashboard() {
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [form, setForm] = useState(empty);
  const [foods, setFoods] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/food/mine').then((r) => setFoods(r.data));
    api.get('/requests/incoming').then((r) => setReqs(r.data));
  };

  useEffect(() => {
    api.get('/food/meta').then((r) => setMeta(r.data));
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    try {
      await api.post('/food', {
        ...form,
        quantity: Number(form.quantity),
        prepared_time: toSql(form.prepared_time),
        expiry_time: toSql(form.expiry_time),
      });
      setForm(empty);
      setMsg('Food posted!');
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to post');
    }
  };

  const act = async (method, url, body) => {
    try {
      await api[method](url, body);
      setMsg('Done');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Action failed');
    }
    load();
  };

  const remove = (id) => {
    if (confirm('Delete this listing?')) act('delete', `/food/${id}`);
  };

  const distribute = (id) => {
    const who = prompt('Collected by (name)?') || 'Recipient';
    act('post', `/requests/${id}/distribute`, { collected_by: who });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Provider dashboard</h2>
      {msg && <p><i>{msg}</i></p>}

      <h3>Post food</h3>
      <form onSubmit={post} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Food name" value={form.food_name} onChange={set('food_name')} required />
        <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={set('quantity')} required />
        <input placeholder="Unit (plates, kg...)" value={form.unit} onChange={set('unit')} required />
        <label>Prepared at
          <input type="datetime-local" value={form.prepared_time} onChange={set('prepared_time')} required />
        </label>
        <label>Expires at
          <input type="datetime-local" value={form.expiry_time} onChange={set('expiry_time')} required />
        </label>
        <select value={form.category_id} onChange={set('category_id')} required>
          <option value="">Category</option>
          {meta.categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
        <select value={form.location_id} onChange={set('location_id')} required>
          <option value="">Location</option>
          {meta.locations.map((l) => (
            <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
          ))}
        </select>
        <button type="submit">Post food</button>
      </form>

      <h3>Incoming requests</h3>
      <table cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>#</th><th>Food</th><th>From</th><th>Qty</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reqs.map((r) => (
            <tr key={r.request_id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{r.request_id}</td>
              <td>{r.food_name}</td>
              <td>{r.recipient_name}</td>
              <td>{r.requested_quantity} {r.unit}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'Pending' && (
                  <>
                    <button onClick={() => act('patch', `/requests/${r.request_id}/approve`)}>Approve</button>{' '}
                    <button onClick={() => act('patch', `/requests/${r.request_id}/reject`)}>Reject</button>
                  </>
                )}
                {r.status === 'Approved' && (
                  <button onClick={() => distribute(r.request_id)}>Mark distributed</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reqs.length === 0 && <p>No requests yet.</p>}

      <h3>My listings</h3>
      <table cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>Food</th><th>Qty left</th><th>Expires</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.food_id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{f.food_name}</td>
              <td>{f.quantity} {f.unit}</td>
              <td>{new Date(f.expiry_time).toLocaleString()}</td>
              <td>{f.status}</td>
              <td><button onClick={() => remove(f.food_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {foods.length === 0 && <p>No listings yet.</p>}
    </div>
  );
}