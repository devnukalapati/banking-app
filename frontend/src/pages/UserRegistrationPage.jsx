import { useState } from 'react';
import Banner from '../components/Banner';
import { registerUser } from '../services/userApi';
import './UserRegistrationPage.css';

const rules = [
  { id: 'len',   label: 'At least 8 characters',  test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter',    test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter',    test: (p) => /[a-z]/.test(p) },
  { id: 'num',   label: 'One number',              test: (p) => /[0-9]/.test(p) },
];

export default function UserRegistrationPage({ applicationData, onSuccess, onReset }) {
  const [form, setForm]           = useState({ username: '', password: '', confirm: '' });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState('');
  const [showPass, setShowPass]   = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.username.trim())                         errs.username = 'Username is required';
    else if (form.username.length < 3)                 errs.username = 'Must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))  errs.username = 'Letters, numbers and underscores only';

    if (!form.password)                                errs.password = 'Password is required';
    else if (!rules.every((r) => r.test(form.password))) errs.password = 'Password does not meet all requirements';

    if (!form.confirm)                                 errs.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password)           errs.confirm = 'Passwords do not match';

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const response = await registerUser({
        customerId: applicationData.id,
        username:   form.username,
        password:   form.password,
      });
      onSuccess(response);
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="reg-page">
      <Banner />
      <div className="reg-body">
        <div className="reg-card">
          <div className="reg-header">
            <span className="reg-step-badge">Step 2 of 3</span>
            <h1 className="reg-title">Create Your Account</h1>
            <p className="reg-subtitle">
              Great news, <strong>{applicationData.firstName}</strong>! Choose a username
              and password to secure your NexaBank account.
            </p>
          </div>

          {apiError && <div className="reg-api-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="reg-field">
              <label htmlFor="username">Username <span className="required">*</span></label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. jane_smith"
                autoComplete="username"
                maxLength={20}
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username
                ? <span className="reg-error">{errors.username}</span>
                : <span className="reg-hint">3–20 characters, letters, numbers, underscores</span>}
            </div>

            {/* Password */}
            <div className="reg-field">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={errors.password ? 'input-error' : ''}
                />
                <button type="button" className="pass-toggle"
                  onClick={() => setShowPass((v) => !v)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span className="reg-error">{errors.password}</span>}

              {/* Password rules checklist */}
              {form.password && (
                <ul className="pass-rules">
                  {rules.map((r) => (
                    <li key={r.id} className={r.test(form.password) ? 'rule-pass' : 'rule-fail'}>
                      {r.test(form.password) ? '✓' : '✗'} {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className="reg-field">
              <label htmlFor="confirm">Confirm Password <span className="required">*</span></label>
              <input
                id="confirm"
                name="confirm"
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className={errors.confirm ? 'input-error' : ''}
              />
              {errors.confirm && <span className="reg-error">{errors.confirm}</span>}
            </div>

            <div className="reg-actions">
              <button type="submit" className="btn-reg-primary" disabled={submitting}>
                {submitting ? <><span className="spinner-sm" /> Creating…</> : 'Create Account →'}
              </button>
              <button type="button" className="btn-reg-ghost" onClick={onReset}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
