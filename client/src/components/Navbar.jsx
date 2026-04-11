import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();                          // clears token from localStorage + context
    navigate('/login', { replace: true });
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>💰 FinTracker</Link>

      <div style={styles.links}>
        <Link to="/dashboard"    style={styles.link}>Dashboard</Link>
        <Link to="/transactions" style={styles.link}>Transactions</Link>
        <Link to="/budgets"      style={styles.link}>Budgets</Link>
        <Link to="/upload"       style={styles.link}>Upload CSV</Link>
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>Hi, {user?.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav:       { display: 'flex', alignItems: 'center', padding: '0 24px', height: 56, background: '#fff', borderBottom: '1px solid #e5e5e5', gap: 24 },
  brand:     { fontWeight: 700, fontSize: 16, color: '#2563eb', textDecoration: 'none', marginRight: 8 },
  links:     { display: 'flex', gap: 4, flex: 1 },
  link:      { padding: '6px 12px', borderRadius: 6, fontSize: 14, color: '#555', textDecoration: 'none' },
  right:     { display: 'flex', alignItems: 'center', gap: 12 },
  userName:  { fontSize: 13, color: '#888' },
  logoutBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'transparent', fontSize: 13, cursor: 'pointer', color: '#555' },
};

export default Navbar;