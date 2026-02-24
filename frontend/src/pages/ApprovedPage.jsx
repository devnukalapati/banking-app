import Banner from '../components/Banner';
import './ResultPage.css';

export default function ApprovedPage({ data, onProceed, onReset }) {
  const name = `${data.firstName} ${data.lastName}`;
  const submittedOn = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="result-page bg-approved">
      <Banner />
      <div className="result-body">
        <div className="result-card">
          <span className="result-icon">✅</span>

          <span className="result-badge badge-approved">Approved</span>

          <h1 className="result-title">Congratulations, {data.firstName}!</h1>
          <p className="result-subtitle">
            Your NexaBank application has been <strong>approved</strong>.<br />
            Welcome to the NexaBank family, {name}.
          </p>

          <div className="result-details">
            <div className="result-detail-row">
              <span className="detail-label">Application ID</span>
              <span className="detail-value">{data.id}</span>
            </div>
            <div className="result-detail-row">
              <span className="detail-label">Account Holder</span>
              <span className="detail-value">{name}</span>
            </div>
            <div className="result-detail-row">
              <span className="detail-label">SSN on File</span>
              <span className="detail-value">{data.ssnMasked}</span>
            </div>
            <div className="result-detail-row">
              <span className="detail-label">Submitted On</span>
              <span className="detail-value">{submittedOn}</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn-primary-result btn-approved" onClick={onProceed}>
              Set Up Your Account →
            </button>
            <button className="btn-secondary-result" onClick={onReset}>
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
