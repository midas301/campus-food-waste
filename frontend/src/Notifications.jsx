import { useEffect, useState } from 'react';
import api from './api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () =>
    api.get('/notifications').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // refresh every 15 seconds
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next && unread > 0) {
      await api.patch('/notifications/read'); // mark read when the panel closes
      load();
    }
  };

  return (
    <span style={{ position: 'relative', marginRight: 16 }}>
      <button onClick={toggle}>
        🔔 {unread > 0 && <b style={{ color: 'red' }}>{unread}</b>}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 32, width: 320, maxHeight: 300,
            overflowY: 'auto', background: 'white', color: 'black',
            border: '1px solid #ccc', padding: 8, zIndex: 10,
          }}
        >
          {items.length === 0 && <p>No notifications.</p>}
          {items.map((n) => (
            <div
              key={n._id}
              style={{ padding: 6, borderBottom: '1px solid #eee', fontWeight: n.read ? 'normal' : 'bold' }}
            >
              {n.message}
              <div style={{ fontSize: 11, color: '#777' }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}