import { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import { getAccount, getTransactions } from '../services/accountApi';
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

export default function DashboardPage({ loginData, onSignOut, onHome }) {
  const [account, setAccount]       = useState(null);
  const [transactions, setTxns]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

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
            {/* Balance card */}
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

            {/* Details row */}
            <div className="db-details-row">
              {/* Customer profile */}
              <div className="db-section">
                <h2 className="db-section-title">Customer Profile</h2>
                <div className="db-info-list">
                  <InfoRow label="Full Name"     value={`${loginData.firstName} ${loginData.lastName}`} />
                  <InfoRow label="Username"      value={`@${loginData.username}`} mono />
                  <InfoRow label="Identity"      value={loginData.mfaVerified ? '✅ Verified' : '⚠️ Pending'} />
                  <InfoRow label="Member Since"  value={formatDate(account.createdAt)} />
                </div>
              </div>

              {/* Account info */}
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

            {/* Transactions */}
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
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="db-info-row">
      <span className="db-info-label">{label}</span>
      <span className={`db-info-value${mono ? ' mono' : ''}`}>{value}</span>
    </div>
  );
}
