import { useState } from 'react';
import Banner from '../components/Banner';
import { loginUser } from '../services/userApi';
import './LoginPage.css';

export default function LoginPage({ onSuccess, onBack }) {
  const [form, setForm]             = useState({ username: '', password: '' });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [showPass, setShowPass]     = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password)        errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const response = await loginUser({ username: form.username, password: form.password });
      onSuccess(response);
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Sign in failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <Banner />
      <div className="login-body">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your NexaBank account.</p>

          {apiError && <div className="login-api-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder="Enter your username"
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && <span className="login-error">{errors.username}</span>}
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={errors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="login-pass-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span className="login-error">{errors.password}</span>}
            </div>

            <div className="login-actions">
              <button type="submit" className="btn-login-primary" disabled={submitting}>
                {submitting ? <><span className="spinner-sm" /> Signing in…</> : 'Sign In →'}
              </button>
              <button type="button" className="btn-login-ghost" onClick={onBack}>
                ← Back to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
