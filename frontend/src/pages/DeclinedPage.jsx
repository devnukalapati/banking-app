import Banner from '../components/Banner';
import './ResultPage.css';

export default function DeclinedPage({ data, onReset, onHome }) {
  const name = `${data.firstName} ${data.lastName}`;
  const submittedOn = new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Reapply date: 90 days from submission
  const reapplyDate = new Date(data.createdAt);
  reapplyDate.setDate(reapplyDate.getDate() + 90);
  const reapplyOn = reapplyDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="result-page bg-declined">
      <Banner onHome={onHome} />
      <div className="result-body">
        <div className="result-card">
          <span className="result-icon">❌</span>

          <span className="result-badge badge-declined">Not Approved</span>

          <h1 className="result-title">Application Not Approved</h1>
          <p className="result-subtitle">
            We're sorry, {data.firstName}. After careful review, we're
            unable to approve your application at this time.
          </p>

          <div className="result-info-box info-box-declined">
            📅 &nbsp;You may reapply after <strong>{reapplyOn}</strong> (90 days from submission).
            If you believe this decision was made in error, please contact NexaBank support.
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
            <div className="result-detail-row">
              <span className="detail-label">Eligible to Reapply</span>
              <span className="detail-value">{reapplyOn}</span>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn-primary-result btn-declined" onClick={onReset}>
              Contact Support
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
