import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [form,setForm] = useState({email: '', password: ''});
    const [error,setError] = useState('');
    const [loading,setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const {data} = await api.post('/auth/login',form);
            login(data.token, data.user);
            navigate('/dashboard', {replace: true});
        } catch (err) {
            setError(err.response?.data?.message || 'Login Failed.');
        }finally{
            setLoading(false);
        }
    };

    return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Personal Finance Tracker</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Email</label>
            <input name="email" type="email" value={form.email}
              onChange={handleChange} required style={styles.input} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handleChange} required style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card:     { background: '#fff', borderRadius: 12, padding: '36px 40px', width: '100%', maxWidth: 400, border: '1px solid #e5e5e5' },
  title:    { margin: '0 0 4px', fontSize: 22, fontWeight: 600 },
  sub:      { margin: '0 0 24px', fontSize: 13, color: '#888' },
  form:     { display: 'flex', flexDirection: 'column' },
  label:    { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#444' },
  input:    { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn:      { marginTop: 8, padding: '10px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  footer:   { textAlign: 'center', fontSize: 13, color: '#666', marginTop: 20 },
};

export default LoginPage;