import Banner from '../components/Banner';
import './ResultPage.css';

export default function PendingPage({ data, onReset }) {
  const name = `${data.firstName} ${data.lastName}`;
  const submittedOn = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="result-page bg-pending">
      <Banner />
      <div className="result-body">
        <div className="result-card">
          <span className="result-icon">⏳</span>

          <span className="result-badge badge-pending">Under Review</span>

          <h1 className="result-title">Application Under Review</h1>
          <p className="result-subtitle">
            Thank you, {data.firstName}. We've received your application
            and our team is currently reviewing it.
          </p>

          <div className="result-info-box info-box-pending">
            📋 &nbsp;You can expect a decision within <strong>3–5 business days</strong>.
            We'll notify you at <strong>{data.email}</strong> once a decision has been made.
          </div>

          <div className="result-details">
            <div className="result-detail-row">
              <span className="detail-label">Reference ID</span>
              <span className="detail-value">{data.id}</span>
            </div>
            <div className="result-detail-row">
              <span className="detail-label">Applicant</span>
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
            <button className="btn-primary-result btn-pending" onClick={onReset}>
              Submit Another Application
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
