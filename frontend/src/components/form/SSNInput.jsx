import { useState } from 'react';

function formatSSN(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function SSNInput({ value, error, onChange }) {
  const [showSSN, setShowSSN] = useState(false);

  function handleChange(e) {
    const formatted = formatSSN(e.target.value);
    onChange({ target: { name: 'ssn', value: formatted } });
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon">🔒</span>
        <h2 className="section-title">Social Security Number</h2>
      </div>

      <div className="ssn-notice">
        <span className="ssn-notice-icon">🛡️</span>
        <p>
          Your SSN is encrypted with AES-256-GCM before storage and is never
          transmitted in plain text after submission.
        </p>
      </div>

      <div className="field-grid">
        <div className="field field-span-2">
          <label htmlFor="ssn">
            Social Security Number <span className="required">*</span>
          </label>
          <div className="ssn-input-wrap">
            <input
              id="ssn"
              name="ssn"
              type={showSSN ? 'text' : 'password'}
              value={value}
              onChange={handleChange}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              autoComplete="off"
              inputMode="numeric"
              className={`ssn-input${error ? ' input-error' : ''}`}
              aria-describedby="ssn-hint"
            />
            <button
              type="button"
              className="ssn-toggle"
              onClick={() => setShowSSN((v) => !v)}
              aria-label={showSSN ? 'Hide SSN' : 'Show SSN'}
            >
              {showSSN ? '🙈 Hide' : '👁 Show'}
            </button>
          </div>
          {error && <span className="error-msg">{error}</span>}
          <span id="ssn-hint" className="field-hint">Format: XXX-XX-XXXX</span>
        </div>
      </div>
    </section>
  );
}
