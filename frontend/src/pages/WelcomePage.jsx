import Banner from '../components/Banner';
import './WelcomePage.css';

export default function WelcomePage({ registrationData, applicationData, onDashboard, onReset, onHome }) {
  return (
    <div className="welcome-page">
      <Banner onHome={onHome} />
      <div className="welcome-body">
        <div className="welcome-card">
          <div className="welcome-confetti">🎉</div>
          <h1 className="welcome-title">
            Welcome to NexaBank,<br />{applicationData.firstName}!
          </h1>
          <p className="welcome-subtitle">
            Your account has been created and your identity has been verified.
            You're all set to start banking.
          </p>

          <div className="welcome-account-box">
            <div className="welcome-account-row">
              <span className="welcome-account-label">Username</span>
              <span className="welcome-account-value">@{registrationData.username}</span>
            </div>
            <div className="welcome-account-row">
              <span className="welcome-account-label">Account Holder</span>
              <span className="welcome-account-value">
                {applicationData.firstName} {applicationData.lastName}
              </span>
            </div>
            <div className="welcome-account-row">
              <span className="welcome-account-label">Application ID</span>
              <span className="welcome-account-value mono">{applicationData.id}</span>
            </div>
            <div className="welcome-account-row">
              <span className="welcome-account-label">Status</span>
              <span className="welcome-account-value status-approved">✅ Approved &amp; Verified</span>
            </div>
          </div>

          <div className="welcome-actions">
            <button className="btn-welcome-primary" onClick={onDashboard}>
              Go to Dashboard
            </button>
            <button className="btn-welcome-secondary" onClick={onReset}>
              Register Another Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
