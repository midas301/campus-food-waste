import { useEffect, useState } from 'react';
import api from '../api';

export default function MyRequests() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/requests/mine').then((r) => setRows(r.data));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>My requests</h2>
      <table cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>#</th>
            <th>Food</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Requested</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.request_id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{r.request_id}</td>
              <td>{r.food_name}</td>
              <td>{r.requested_quantity} {r.unit}</td>
              <td>{r.status}</td>
              <td>{new Date(r.request_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p>You haven't requested anything yet.</p>}
    </div>
  );
}