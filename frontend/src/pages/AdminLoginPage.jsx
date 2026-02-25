import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('nexabank-admin', 'true');
      navigate('/admin/offers');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span className="admin-login-brand">NexaBank</span>
          <span className="admin-login-subtitle">Admin Portal</span>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <h1 className="admin-login-title">Sign In</h1>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="admin-login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
