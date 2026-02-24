import Banner from '../components/Banner';
import './DashboardPage.css';

export default function DashboardPage({ loginData, onSignOut }) {
  const fullName     = `${loginData.firstName} ${loginData.lastName}`;
  const statusLabel  = loginData.applicationStatus?.toLowerCase() ?? 'unknown';
  const statusClass  = `status-badge status-${statusLabel}`;

  return (
    <div className="dashboard-page">
      <Banner />
      <div className="dashboard-body">
        <div className="dashboard-card">
          <div className="dashboard-greeting">
            <span className="dashboard-wave">👋</span>
            <div>
              <h1 className="dashboard-title">Welcome back, {loginData.firstName}!</h1>
              <p className="dashboard-subtitle">Here's a summary of your NexaBank account.</p>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Account Overview</h2>
            <div className="dashboard-rows">
              <div className="dashboard-row">
                <span className="dr-label">Account Holder</span>
                <span className="dr-value">{fullName}</span>
              </div>
              <div className="dashboard-row">
                <span className="dr-label">Username</span>
                <span className="dr-value mono">{loginData.username}</span>
              </div>
              <div className="dashboard-row">
                <span className="dr-label">Application ID</span>
                <span className="dr-value mono">{loginData.customerId}</span>
              </div>
              <div className="dashboard-row">
                <span className="dr-label">Application Status</span>
                <span className={statusClass}>
                  {loginData.applicationStatus}
                </span>
              </div>
              <div className="dashboard-row">
                <span className="dr-label">Identity Verified</span>
                <span className="dr-value">
                  {loginData.mfaVerified ? '✅ Verified' : '⚠️ Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="btn-dashboard-secondary" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
