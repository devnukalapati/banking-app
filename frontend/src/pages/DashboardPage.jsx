import { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import { getAccount, getTransactions } from '../services/accountApi';
import { CREDIT_CARDS } from '../data/creditCards';
import './DashboardPage.css';

const CATEGORY_ICONS = {
  Deposit:       '🏦',
  Income:        '💼',
  Groceries:     '🛒',
  Entertainment: '🎬',
  Utilities:     '⚡',
  Shopping:      '🛍️',
  Dining:        '☕',
  Transfer:      '↔️',
  Transportation:'⛽',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Compute rewards earned from debit transactions using the card's category multipliers.
 * Returns { total (in $), byCategory: [{ category, multiplier, earned }] }
 */
function computeRewards(transactions, card) {
  if (!card?.rewards) return { total: 0, byCategory: [] };

  const { categories, pointValue, type } = card.rewards;
  const accumulator = {};

  for (const txn of transactions) {
    if (txn.type !== 'DEBIT') continue;
    const cat = txn.category ?? 'Other';
    const multiplier = categories[cat] ?? categories['*'] ?? 1;
    if (!accumulator[cat]) accumulator[cat] = { multiplier, rawAmount: 0 };
    accumulator[cat].rawAmount += Number(txn.amount);
  }

  const byCategory = Object.entries(accumulator).map(([category, { multiplier, rawAmount }]) => {
    // For cashback: multiplier is %, earned = amount * multiplier / 100
    // For points:   earned = amount * multiplier * pointValue
    const earned = type === 'cashback'
      ? rawAmount * multiplier / 100
      : rawAmount * multiplier * pointValue;
    return { category, multiplier, rawAmount, earned };
  }).sort((a, b) => b.earned - a.earned);

  const total = byCategory.reduce((sum, r) => sum + r.earned, 0);
  return { total, byCategory };
}

export default function DashboardPage({ loginData, onSignOut, onHome }) {
  const [account, setAccount]   = useState(null);
  const [transactions, setTxns] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const card = CREDIT_CARDS.find((c) => c.id === loginData.cardProduct) ?? null;

  useEffect(() => {
    async function load() {
      try {
        const [acct, txns] = await Promise.all([
          getAccount(loginData.customerId),
          getTransactions(loginData.customerId),
        ]);
        setAccount(acct);
        setTxns(txns);
      } catch {
        setError('Unable to load account data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [loginData.customerId]);

  const statusLabel = loginData.applicationStatus?.toLowerCase() ?? 'unknown';
  const rewards = computeRewards(transactions, card);

  return (
    <div className="db-page">
      <Banner onHome={onHome} />

      {/* Top bar */}
      <div className="db-topbar">
        <div className="db-topbar-greeting">
          <span className="db-topbar-name">Welcome back, {loginData.firstName} {loginData.lastName}</span>
          <span className="db-topbar-username">@{loginData.username}</span>
        </div>
        <button className="btn-signout" onClick={onSignOut}>Sign Out</button>
      </div>

      <div className="db-body">
        {loading && (
          <div className="db-loading">
            <span className="db-spinner" />
            <p>Loading your account…</p>
          </div>
        )}

        {error && <div className="db-error">⚠️ {error}</div>}

        {!loading && !error && account && (
          <>
            {/* Balance card — always visible */}
            <div className="db-balance-card">
              <div className="db-balance-left">
                <p className="db-balance-label">Total Balance</p>
                <p className="db-balance-amount">{formatCurrency(account.balance)}</p>
                <p className="db-balance-meta">
                  {account.accountNumber} &nbsp;·&nbsp; {account.accountType} &nbsp;·&nbsp; {account.currency}
                </p>
              </div>
              <div className="db-balance-right">
                <span className={`db-status-badge db-status-${statusLabel}`}>
                  {loginData.applicationStatus}
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <nav className="db-tabs" role="tablist">
              {['overview', 'rewards', 'terms', 'offers'].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`db-tab-btn${activeTab === tab ? ' db-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <OverviewTab
                loginData={loginData}
                account={account}
                transactions={transactions}
              />
            )}

            {activeTab === 'rewards' && (
              <RewardsTab card={card} rewards={rewards} />
            )}

            {activeTab === 'terms' && (
              <TermsTab card={card} />
            )}

            {activeTab === 'offers' && (
              <OffersTab card={card} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Overview tab ──────────────────────────────────────────────────────────── */
function OverviewTab({ loginData, account, transactions }) {
  return (
    <>
      <div className="db-details-row">
        <div className="db-section">
          <h2 className="db-section-title">Customer Profile</h2>
          <div className="db-info-list">
            <InfoRow label="Full Name"    value={`${loginData.firstName} ${loginData.lastName}`} />
            <InfoRow label="Username"     value={`@${loginData.username}`} mono />
            <InfoRow label="Identity"     value={loginData.mfaVerified ? '✅ Verified' : '⚠️ Pending'} />
            <InfoRow label="Member Since" value={formatDate(account.createdAt)} />
          </div>
        </div>

        <div className="db-section">
          <h2 className="db-section-title">Account Details</h2>
          <div className="db-info-list">
            <InfoRow label="Account Number" value={account.accountNumber} mono />
            <InfoRow label="Account Type"   value={account.accountType} />
            <InfoRow label="Currency"        value={account.currency} />
            <InfoRow label="Account ID"      value={account.accountId.slice(0, 8) + '…'} mono />
          </div>
        </div>
      </div>

      <div className="db-section db-section--full">
        <h2 className="db-section-title">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="db-no-txns">No transactions yet.</p>
        ) : (
          <div className="db-txn-list">
            {transactions.map((txn) => (
              <div key={txn.id} className="db-txn-row">
                <span className="db-txn-icon">
                  {CATEGORY_ICONS[txn.category] ?? '💳'}
                </span>
                <div className="db-txn-info">
                  <span className="db-txn-desc">{txn.description}</span>
                  <span className="db-txn-meta">{txn.category} &nbsp;·&nbsp; {formatDate(txn.transactedAt)}</span>
                </div>
                <span className={`db-txn-amount db-txn-${txn.type.toLowerCase()}`}>
                  {txn.type === 'CREDIT' ? '+' : '−'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Rewards tab ───────────────────────────────────────────────────────────── */
function RewardsTab({ card, rewards }) {
  if (!card) {
    return (
      <div className="db-section db-section--full db-no-card">
        <p>Card information not available. Please contact support.</p>
      </div>
    );
  }

  const { type, welcomeBonus, welcomeBonusLabel, pointValue, categories } = card.rewards;
  const isPoints = type === 'points';
  const welcomeValue = isPoints ? welcomeBonus * pointValue : welcomeBonus;

  return (
    <div className="db-section db-section--full">
      <h2 className="db-section-title">Rewards — {card.name}</h2>

      {/* Summary hero */}
      <div className="db-rewards-summary">
        <div className="db-rewards-summary-item">
          <span className="db-rewards-summary-label">Earned to Date</span>
          <span className="db-rewards-summary-value">{formatCurrency(rewards.total)}</span>
        </div>
        {welcomeBonusLabel && (
          <div className="db-rewards-summary-item">
            <span className="db-rewards-summary-label">Welcome Bonus</span>
            <span className="db-rewards-summary-value">{welcomeBonusLabel}</span>
          </div>
        )}
        <div className="db-rewards-summary-item">
          <span className="db-rewards-summary-label">Lifetime Value</span>
          <span className="db-rewards-summary-value">
            {formatCurrency(rewards.total + welcomeValue)}
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <h3 className="db-rewards-breakdown-title">Earning Rate by Category</h3>
      <div className="db-rewards-breakdown">
        {Object.entries(categories).map(([cat, multiplier]) => {
          const catRow = rewards.byCategory.find((r) => r.category === cat);
          const earned = catRow?.earned ?? 0;
          const label = cat === '*' ? 'All Other Purchases' : cat;
          const icon = CATEGORY_ICONS[cat] ?? '💳';
          const rateLabel = isPoints
            ? `${multiplier}× points`
            : `${multiplier}% cashback`;

          return (
            <div key={cat} className="db-rewards-row">
              <span className="db-rewards-icon">{cat === '*' ? '💳' : icon}</span>
              <span className="db-rewards-cat">{label}</span>
              <span className="db-rewards-rate">{rateLabel}</span>
              <span className="db-rewards-earned">{formatCurrency(earned)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Terms tab ─────────────────────────────────────────────────────────────── */
function TermsTab({ card }) {
  if (!card) {
    return (
      <div className="db-section db-section--full db-no-card">
        <p>Card information not available. Please contact support.</p>
      </div>
    );
  }

  const introOffer = card.offers.find((o) =>
    o.text.toLowerCase().includes('intro') || o.text.toLowerCase().includes('0%')
  );

  return (
    <div className="db-section db-section--full">
      <h2 className="db-section-title">Card Terms — {card.name}</h2>
      <div className="db-terms-list">
        <TermRow label="Annual Fee"     value={card.annualFee} />
        <TermRow label="APR Range"      value={card.apr} />
        <TermRow label="Card Network"   value={card.network} />
        <TermRow label="Credit Limit"   value="Set after approval" />
        {introOffer && (
          <TermRow label="Intro Offer" value={introOffer.text} />
        )}
        <TermRow label="Foreign Transaction Fee" value={
          card.offers.some((o) => o.text.toLowerCase().includes('foreign')) ? 'None' : 'Up to 3%'
        } />
      </div>
    </div>
  );
}

/* ── Offers tab ────────────────────────────────────────────────────────────── */
function OffersTab({ card }) {
  if (!card) {
    return (
      <div className="db-section db-section--full db-no-card">
        <p>Card information not available. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="db-section db-section--full">
      <h2 className="db-section-title">Special Offers — {card.name}</h2>

      {card.rewards.welcomeBonusLabel && (
        <div className="db-offers-welcome">
          <span className="db-offers-welcome-icon">🎁</span>
          <div>
            <p className="db-offers-welcome-label">Welcome Bonus</p>
            <p className="db-offers-welcome-value">{card.rewards.welcomeBonusLabel}</p>
          </div>
        </div>
      )}

      <div className="db-offers-list">
        {card.offers.map((offer, i) => (
          <div key={i} className="db-offers-row">
            <span className="db-offers-icon">{offer.icon}</span>
            <span className="db-offers-text">{offer.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared helpers ────────────────────────────────────────────────────────── */
function InfoRow({ label, value, mono }) {
  return (
    <div className="db-info-row">
      <span className="db-info-label">{label}</span>
      <span className={`db-info-value${mono ? ' mono' : ''}`}>{value}</span>
    </div>
  );
}

function TermRow({ label, value }) {
  return (
    <div className="db-terms-row">
      <span className="db-terms-label">{label}</span>
      <span className="db-terms-value">{value}</span>
    </div>
  );
}
