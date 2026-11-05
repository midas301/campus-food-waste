import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import api from '../api';

const Chart = ({ title, data, line }) => (
  <div style={{ width: 420, height: 280 }}>
    <h4>{title}</h4>
    {data.length === 0 ? (
      <p>No data yet.</p>
    ) : (
      <ResponsiveContainer width="100%" height="85%">
        {line ? (
          <LineChart data={data}>
            <XAxis dataKey="_id" /><YAxis allowDecimals={false} /><Tooltip />
            <Line dataKey="total" stroke="#2e7d32" />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey="_id" /><YAxis allowDecimals={false} /><Tooltip />
            <Bar dataKey="total" fill="#2e7d32" />
          </BarChart>
        )}
      </ResponsiveContainer>
    )}
  </div>
);

export default function AdminDashboard() {
  const [d, setD] = useState({});

  useEffect(() => {
    ['summary', 'by-reason', 'by-category', 'by-location', 'weekly'].forEach((m) =>
      api.get(`/analytics/${m}`).then((r) => setD((p) => ({ ...p, [m]: r.data })))
    );
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin dashboard</h2>
      {d.summary && (
        <p>
          Distributed: <b>{d.summary.distributed}</b> · Wasted: <b>{d.summary.wasted}</b>
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <Chart title="Waste by reason" data={d['by-reason'] || []} />
        <Chart title="Waste by category" data={d['by-category'] || []} />
        <Chart title="Waste by location" data={d['by-location'] || []} />
        <Chart title="Weekly waste trend" data={d.weekly || []} line />
      </div>
    </div>
  );
}