import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Recipient',
  });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Name" value={form.name} onChange={set('name')} />
        <input placeholder="Email" value={form.email} onChange={set('email')} />
        <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set('password')}
        />
        <select value={form.role} onChange={set('role')}>
          <option value="Recipient">Recipient (I want food)</option>
          <option value="Provider">Provider (I have food)</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}