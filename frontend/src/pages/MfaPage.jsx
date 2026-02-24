import { useRef, useState } from 'react';
import Banner from '../components/Banner';
import { verifyMfa } from '../services/userApi';
import './MfaPage.css';

export default function MfaPage({ registrationData, applicationData, onSuccess, onReset }) {
  const [digits, setDigits]         = useState(['', '', '', '']);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake]           = useState(false);
  const inputs = useRef([]);

  const code = digits.join('');

  function handleDigitChange(idx, e) {
    const val = e.target.value.replace(/\D/, '').slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');

    if (val && idx < 3) {
      inputs.current[idx + 1]?.focus();
    }
    // Auto-submit when all 4 filled
    if (val && idx === 3) {
      const full = [...next].join('');
      if (full.length === 4) submitCode(full);
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const next = ['', '', '', ''];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    inputs.current[Math.min(pasted.length, 3)]?.focus();
    if (pasted.length === 4) submitCode(pasted);
  }

  async function submitCode(mfaCode) {
    if (mfaCode.length !== 4) return;
    setSubmitting(true);
    try {
      const response = await verifyMfa({ userId: registrationData.userId, mfaCode });
      if (response.verified) {
        onSuccess();
      } else {
        setError('Incorrect code. Please try again.');
        triggerShake();
        setDigits(['', '', '', '']);
        setTimeout(() => inputs.current[0]?.focus(), 100);
      }
    } catch {
      setError('Verification failed. Please try again.');
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleSubmitBtn() {
    submitCode(code);
  }

  return (
    <div className="mfa-page">
      <Banner />
      <div className="mfa-body">
        <div className="mfa-card">
          <div className="mfa-lock-icon">🔐</div>
          <span className="mfa-step-badge">Step 3 of 3</span>
          <h1 className="mfa-title">Verify Your Identity</h1>
          <p className="mfa-subtitle">
            Enter the 4-digit verification code sent to your registered
            phone number to complete account setup.
          </p>

          <div className={`mfa-otp-wrap ${shake ? 'shake' : ''}`}>
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => (inputs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                autoFocus={idx === 0}
                autoComplete="one-time-code"
                className={`mfa-box ${error ? 'mfa-box-error' : ''} ${d ? 'mfa-box-filled' : ''}`}
                disabled={submitting}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {error && <p className="mfa-error">⚠️ {error}</p>}

          <button
            className="btn-mfa-verify"
            onClick={handleSubmitBtn}
            disabled={code.length !== 4 || submitting}
          >
            {submitting ? <><span className="spinner-mfa" /> Verifying…</> : 'Verify Code'}
          </button>

          <p className="mfa-resend">
            Didn't receive a code?{' '}
            <button className="btn-resend" type="button" onClick={() => {}}>
              Resend
            </button>
          </p>

          <button className="btn-mfa-back" onClick={onReset}>
            ← Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
