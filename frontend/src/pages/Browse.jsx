import { useEffect, useState } from 'react';
import api from '../api';

export default function Browse() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [filters, setFilters] = useState({ category_id: '', location_id: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/food/meta').then((r) => setMeta(r.data));
  }, []);

  useEffect(() => {
    api.get('/food', { params: filters }).then((r) => setItems(r.data));
  }, [filters]);

  const request = async (food_id) => {
    const qty = Number(prompt('How many?'));
    if (!qty) return;
    try {
      await api.post('/requests', { food_id, requested_quantity: qty });
      setMsg('Request sent!');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Request failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Available food</h2>
      <select onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
        <option value="">All categories</option>
        {meta.categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
        ))}
      </select>{' '}
      <select onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}>
        <option value="">All locations</option>
        {meta.locations.map((l) => (
          <option key={l.location_id} value={l.location_id}>{l.location_name}</option>
        ))}
      </select>
      {msg && <p>{msg}</p>}
      <ul>
        {items.map((f) => (
          <li key={f.food_id} style={{ margin: '8px 0' }}>
            <b>{f.food_name}</b>: {f.quantity} {f.unit} at {f.location_name}, {f.building} · expires{' '}
            {new Date(f.expiry_time).toLocaleString()}{' '}
            <button onClick={() => request(f.food_id)}>Request</button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No food available right now.</p>}
    </div>
  );
}