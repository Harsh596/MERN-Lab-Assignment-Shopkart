import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.successMessage;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await login(email.trim(), password);

      if (response?.status === 200 || response?.data?.success || response?.success || response) {
        navigate('/home');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError(err.response.data?.message || 'Invalid credentials');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to sign in. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <span style={styles.brandBadge}>🛍️ ShopKart</span>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>
        </div>

        {successMessage && !error && (
          <div style={styles.successAlert} role="status">
            <span style={styles.alertIcon}>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert} role="alert">
            <span style={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordLabelRow}>
              <label style={styles.label} htmlFor="login-password">Password</label>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '40px 32px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  brandHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  brandBadge: {
    background: '#eef2ff',
    color: '#4f46e5',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  alertIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  passwordLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
  },
};