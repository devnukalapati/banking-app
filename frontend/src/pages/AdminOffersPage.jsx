import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardArt from '../components/CardArt';
import { createCreditCard } from '../services/creditCardApi';
import './AdminOffersPage.css';

const NETWORKS = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];

const FEE_PRESETS = ['$0', '$95', '$195', '$295', 'Custom'];

const GRADIENTS = [
  { name: 'Midnight Navy', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 75%, #533483 100%)', chipColor: '#c9a84c' },
  { name: 'Ocean Blue',    gradient: 'linear-gradient(135deg, #0f4c75 0%, #1b7fc4 50%, #00b4d8 100%)',              chipColor: '#e0e0e0' },
  { name: 'Steel Grey',    gradient: 'linear-gradient(135deg, #4a4a4a 0%, #6e6e6e 40%, #9e9e9e 75%, #c8c8c8 100%)', chipColor: '#f5d87a' },
  { name: 'Forest Teal',   gradient: 'linear-gradient(135deg, #134e4a 0%, #0d9488 50%, #2dd4bf 100%)',              chipColor: '#e0e0e0' },
  { name: 'Crimson',       gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ef4444 100%)',              chipColor: '#fbbf24' },
  { name: 'Amber Gold',    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)',              chipColor: '#e0e0e0' },
  { name: 'Indigo',        gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%)',              chipColor: '#fbbf24' },
  { name: 'Emerald',       gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',              chipColor: '#e0e0e0' },
];

const CATEGORIES = ['Groceries', 'Dining', 'Entertainment', 'Shopping', 'Transportation', 'Travel', 'Utilities', 'Gas'];

const INITIAL_FORM = {
  name:              '',
  tagline:           '',
  network:           'VISA',
  annualFeePreset:   '$0',
  annualFeeCustom:   '',
  apr:               '',
  gradientIndex:     0,
  rewardsType:       'points',
  defaultMultiplier: 1,
  categoryRows:      [],
  welcomeBonus:      '',
  welcomeBonusLabel: '',
  offerRows:         [{ icon: '', text: '' }],
};

function buildPreviewCard(form) {
  const g = GRADIENTS[form.gradientIndex] || GRADIENTS[0];
  return {
    id:           'preview',
    name:         form.name || 'New Card',
    tagline:      form.tagline || '',
    network:      form.network,
    annualFee:    form.annualFeePreset === 'Custom' ? (form.annualFeeCustom || '$0') : form.annualFeePreset,
    apr:          form.apr || '—',
    gradient:     g.gradient,
    chipColor:    g.chipColor,
    numberSuffix: '0000',
    offers:       [],
    rewards:      null,
  };
}

function buildPayload(form) {
  const g = GRADIENTS[form.gradientIndex] || GRADIENTS[0];
  const categories = { '*': Number(form.defaultMultiplier) || 1 };
  for (const row of form.categoryRows) {
    if (row.category) categories[row.category] = Number(row.multiplier) || 1;
  }
  return {
    name:              form.name.trim(),
    tagline:           form.tagline.trim(),
    network:           form.network,
    annualFee:         form.annualFeePreset === 'Custom' ? (form.annualFeeCustom || '$0') : form.annualFeePreset,
    apr:               form.apr.trim(),
    gradient:          g.gradient,
    chipColor:         g.chipColor,
    rewardsType:       form.rewardsType,
    rewardsCategories: categories,
    pointValue:        0.01,
    welcomeBonus:      Number(form.welcomeBonus) || 0,
    welcomeBonusLabel: form.welcomeBonusLabel.trim() || null,
    offers:            form.offerRows
                         .filter((r) => r.text.trim())
                         .map((r) => ({ icon: r.icon.trim(), text: r.text.trim() })),
  };
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ card, onCreateAnother, onSignOut }) {
  return (
    <div className="aof-success-page">
      <div className="aof-success-card">
        {/* Badge */}
        <div className="aof-success-badge" aria-hidden="true">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="26" fill="#d1fae5" />
            <path d="M14 27l8 8 16-16" stroke="#059669" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="aof-success-title">Card Product Created!</h1>
        <p className="aof-success-subtitle">
          <strong>{card.name}</strong> is now live and available on the landing page.
        </p>

        {/* Card art */}
        <div className="aof-success-art-wrap">
          <CardArt card={card} size="lg" />
        </div>

        {/* Key specs */}
        <div className="aof-success-specs">
          <div className="aof-success-spec">
            <span className="aof-success-spec-label">Network</span>
            <span className="aof-success-spec-value">{card.network}</span>
          </div>
          <div className="aof-success-spec">
            <span className="aof-success-spec-label">Annual Fee</span>
            <span className="aof-success-spec-value">{card.annualFee}</span>
          </div>
          <div className="aof-success-spec">
            <span className="aof-success-spec-label">APR</span>
            <span className="aof-success-spec-value">{card.apr || '—'}</span>
          </div>
          <div className="aof-success-spec">
            <span className="aof-success-spec-label">Rewards</span>
            <span className="aof-success-spec-value" style={{ textTransform: 'capitalize' }}>
              {card.rewards?.type ?? '—'}
            </span>
          </div>
          {card.rewards?.welcomeBonusLabel && (
            <div className="aof-success-spec aof-success-spec--wide">
              <span className="aof-success-spec-label">Welcome Bonus</span>
              <span className="aof-success-spec-value">{card.rewards.welcomeBonusLabel}</span>
            </div>
          )}
        </div>

        {/* Perks list */}
        {card.offers?.length > 0 && (
          <ul className="aof-success-offers">
            {card.offers.map((o, i) => (
              <li key={i} className="aof-success-offer-item">
                <span className="aof-success-offer-icon">{o.icon}</span>
                <span className="aof-success-offer-text">{o.text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="aof-success-actions">
          <button className="aof-success-btn-primary" onClick={onCreateAnother}>
            Create Another Card
          </button>
          <button className="aof-success-btn-secondary" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminOffersPage() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdCard, setCreatedCard] = useState(null);
  const navigate = useNavigate();

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Category override rows
  function addCategoryRow() {
    setForm((prev) => ({
      ...prev,
      categoryRows: [...prev.categoryRows, { category: '', multiplier: 2 }],
    }));
  }
  function removeCategoryRow(idx) {
    setForm((prev) => ({
      ...prev,
      categoryRows: prev.categoryRows.filter((_, i) => i !== idx),
    }));
  }
  function updateCategoryRow(idx, field, value) {
    setForm((prev) => {
      const rows = [...prev.categoryRows];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, categoryRows: rows };
    });
  }

  // Offer rows
  function addOfferRow() {
    setForm((prev) => ({ ...prev, offerRows: [...prev.offerRows, { icon: '', text: '' }] }));
  }
  function removeOfferRow(idx) {
    setForm((prev) => ({
      ...prev,
      offerRows: prev.offerRows.filter((_, i) => i !== idx),
    }));
  }
  function updateOfferRow(idx, field, value) {
    setForm((prev) => {
      const rows = [...prev.offerRows];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, offerRows: rows };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const created = await createCreditCard(buildPayload(form));
      setCreatedCard(created);   // show success screen
    } catch {
      setSubmitError('Failed to create card. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCreateAnother() {
    setCreatedCard(null);
    setForm(INITIAL_FORM);
  }

  function handleSignOut() {
    localStorage.removeItem('nexabank-admin');
    navigate('/');
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (createdCard) {
    return (
      <div className="admin-offers-page">
        <header className="admin-offers-header">
          <div className="admin-offers-header-inner">
            <div className="admin-offers-brand">
              <span className="admin-offers-logo">NexaBank</span>
              <span className="admin-offers-section">Card Management</span>
            </div>
            <button className="admin-signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </header>
        <SuccessScreen
          card={createdCard}
          onCreateAnother={handleCreateAnother}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  const previewCard = buildPreviewCard(form);

  // ── Form screen ─────────────────────────────────────────────────────────────
  return (
    <div className="admin-offers-page">
      {/* Header */}
      <header className="admin-offers-header">
        <div className="admin-offers-header-inner">
          <div className="admin-offers-brand">
            <span className="admin-offers-logo">NexaBank</span>
            <span className="admin-offers-section">Card Management</span>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="admin-offers-main">
        <div className="admin-offers-layout">
          {/* Form column */}
          <div className="admin-offers-form-col">
            <h1 className="admin-offers-title">Create New Card Product</h1>

            <form onSubmit={handleSubmit} className="admin-card-form">

              {/* Section 1 — Card Identity */}
              <section className="aof-section">
                <h2 className="aof-section-title">Card Identity</h2>
                <div className="aof-field">
                  <label htmlFor="card-name">Card Name <span className="aof-required">*</span></label>
                  <input
                    id="card-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. NexaBank Premier"
                    required
                  />
                </div>
                <div className="aof-field">
                  <label htmlFor="card-tagline">Tagline</label>
                  <input
                    id="card-tagline"
                    type="text"
                    value={form.tagline}
                    onChange={(e) => set('tagline', e.target.value)}
                    placeholder="e.g. Your premium partner in every purchase."
                  />
                </div>
              </section>

              {/* Section 2 — Card Specs */}
              <section className="aof-section">
                <h2 className="aof-section-title">Card Specs</h2>

                <div className="aof-field">
                  <label>Network</label>
                  <div className="aof-pill-group">
                    {NETWORKS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`aof-pill${form.network === n ? ' aof-pill--active' : ''}`}
                        onClick={() => set('network', n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aof-field">
                  <label>Annual Fee</label>
                  <div className="aof-pill-group">
                    {FEE_PRESETS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`aof-pill${form.annualFeePreset === f ? ' aof-pill--active' : ''}`}
                        onClick={() => set('annualFeePreset', f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {form.annualFeePreset === 'Custom' && (
                    <input
                      type="text"
                      className="aof-custom-fee"
                      value={form.annualFeeCustom}
                      onChange={(e) => set('annualFeeCustom', e.target.value)}
                      placeholder="e.g. $450"
                    />
                  )}
                </div>

                <div className="aof-field">
                  <label htmlFor="card-apr">APR</label>
                  <input
                    id="card-apr"
                    type="text"
                    value={form.apr}
                    onChange={(e) => set('apr', e.target.value)}
                    placeholder="e.g. 19.99% – 27.99%"
                  />
                </div>

                <div className="aof-field">
                  <label>Color Theme</label>
                  <div className="aof-gradient-grid">
                    {GRADIENTS.map((g, i) => (
                      <button
                        key={g.name}
                        type="button"
                        title={g.name}
                        className={`aof-gradient-swatch${form.gradientIndex === i ? ' aof-gradient-swatch--active' : ''}`}
                        style={{ background: g.gradient }}
                        onClick={() => set('gradientIndex', i)}
                      >
                        {form.gradientIndex === i && <span className="aof-swatch-check">✓</span>}
                        <span className="aof-swatch-label">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 3 — Rewards */}
              <section className="aof-section">
                <h2 className="aof-section-title">Rewards</h2>

                <div className="aof-field">
                  <label>Rewards Type</label>
                  <div className="aof-pill-group">
                    {['points', 'cashback'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`aof-pill${form.rewardsType === t ? ' aof-pill--active' : ''}`}
                        onClick={() => set('rewardsType', t)}
                      >
                        {t === 'points' ? 'Points' : 'Cashback'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aof-field aof-field--inline">
                  <label htmlFor="default-multiplier">
                    Default multiplier for all purchases
                  </label>
                  <input
                    id="default-multiplier"
                    type="number"
                    min="1"
                    max="20"
                    value={form.defaultMultiplier}
                    onChange={(e) => set('defaultMultiplier', e.target.value)}
                    className="aof-number-input"
                  />
                  <span className="aof-multiplier-unit">
                    {form.rewardsType === 'cashback' ? '%' : '×'}
                  </span>
                </div>

                <div className="aof-field">
                  <label>Category Overrides</label>
                  {form.categoryRows.map((row, i) => (
                    <div key={i} className="aof-category-row">
                      <select
                        value={row.category}
                        onChange={(e) => updateCategoryRow(i, 'category', e.target.value)}
                        className="aof-select"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={row.multiplier}
                        onChange={(e) => updateCategoryRow(i, 'multiplier', e.target.value)}
                        className="aof-number-input"
                      />
                      <span className="aof-multiplier-unit">
                        {form.rewardsType === 'cashback' ? '%' : '×'}
                      </span>
                      <button
                        type="button"
                        className="aof-remove-btn"
                        onClick={() => removeCategoryRow(i)}
                        aria-label="Remove category"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="aof-add-btn" onClick={addCategoryRow}>
                    + Add Category Override
                  </button>
                </div>
              </section>

              {/* Section 4 — Welcome Bonus */}
              <section className="aof-section">
                <h2 className="aof-section-title">Welcome Bonus</h2>
                <div className="aof-two-col">
                  <div className="aof-field">
                    <label htmlFor="welcome-bonus">Amount</label>
                    <input
                      id="welcome-bonus"
                      type="number"
                      min="0"
                      value={form.welcomeBonus}
                      onChange={(e) => set('welcomeBonus', e.target.value)}
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div className="aof-field">
                    <label htmlFor="welcome-bonus-label">Label</label>
                    <input
                      id="welcome-bonus-label"
                      type="text"
                      value={form.welcomeBonusLabel}
                      onChange={(e) => set('welcomeBonusLabel', e.target.value)}
                      placeholder="e.g. 50,000 welcome points"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5 — Perks & Offers */}
              <section className="aof-section">
                <h2 className="aof-section-title">Perks &amp; Offers</h2>
                {form.offerRows.map((row, i) => (
                  <div key={i} className="aof-offer-row">
                    <input
                      type="text"
                      value={row.icon}
                      onChange={(e) => updateOfferRow(i, 'icon', e.target.value)}
                      placeholder="Emoji"
                      className="aof-offer-icon-input"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={row.text}
                      onChange={(e) => updateOfferRow(i, 'text', e.target.value)}
                      placeholder="Perk description"
                      className="aof-offer-text-input"
                    />
                    {form.offerRows.length > 1 && (
                      <button
                        type="button"
                        className="aof-remove-btn"
                        onClick={() => removeOfferRow(i)}
                        aria-label="Remove perk"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="aof-add-btn" onClick={addOfferRow}>
                  + Add Perk
                </button>
              </section>

              {submitError && (
                <div className="aof-submit-error" role="alert">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="aof-submit-btn"
                disabled={submitting || !form.name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Card Product'}
              </button>
            </form>
          </div>

          {/* Preview column */}
          <div className="admin-offers-preview-col">
            <h2 className="aof-preview-title">Live Preview</h2>
            <div className="aof-preview-card-wrap">
              <CardArt card={previewCard} size="lg" />
            </div>
            <div className="aof-preview-details">
              <p className="aof-preview-name">{previewCard.name}</p>
              {previewCard.tagline && (
                <p className="aof-preview-tagline">{previewCard.tagline}</p>
              )}
              <div className="aof-preview-meta">
                <span className="aof-preview-meta-item">
                  <strong>Network</strong> {previewCard.network}
                </span>
                <span className="aof-preview-meta-item">
                  <strong>Fee</strong> {previewCard.annualFee}
                </span>
                <span className="aof-preview-meta-item">
                  <strong>APR</strong> {previewCard.apr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
