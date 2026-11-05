import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Notifications from './Notifications';
import { useAuth, Protected } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import MyRequests from './pages/MyRequests';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WasteLog from './pages/WasteLog';

const home = { Recipient: '/browse', Provider: '/provider', Admin: '/admin' };

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #ddd' }}>
        <b>Campus Food Waste</b>
        {user && <Link to={home[user.role]}>Home</Link>}
        {user?.role === 'Recipient' && <Link to="/my-requests">My requests</Link>}
        {user && user.role !== 'Recipient' && <Link to="/waste">Waste log</Link>}
        <span style={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <Notifications />
              {user.name} ({user.role}) <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to={user ? home[user.role] : '/login'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Protected roles={['Recipient']}><Browse /></Protected>} />
        <Route path="/my-requests" element={<Protected roles={['Recipient']}><MyRequests /></Protected>} />
        <Route path="/provider" element={<Protected roles={['Provider']}><ProviderDashboard /></Protected>} />
        <Route path="/admin" element={<Protected roles={['Admin']}><AdminDashboard /></Protected>} />
        <Route path="/waste" element={<Protected roles={['Provider', 'Admin']}><WasteLog /></Protected>} />
      </Routes>
    </>
  );
}
