import Banner from '../components/Banner';
import './LandingPage.css';

export default function LandingPage({ onApply, onLogin }) {
  return (
    <div className="landing-page">
      <Banner />

      <main className="landing-body">
        <div className="landing-hero">
          <h1 className="landing-headline">
            Banking built for<br />
            <span className="landing-headline-accent">your future</span>
          </h1>
          <p className="landing-tagline">
            Apply for a NexaBank credit card or access your existing account.
          </p>
        </div>

        <div className="landing-cards">
          <button className="landing-card landing-card--apply" onClick={onApply}>
            <span className="lc-icon">💳</span>
            <div className="lc-content">
              <h2 className="lc-title">Apply for a Credit Card</h2>
              <p className="lc-description">
                Start your application today. Get a decision in minutes.
              </p>
            </div>
            <span className="lc-arrow">→</span>
          </button>

          <button className="landing-card landing-card--login" onClick={onLogin}>
            <span className="lc-icon">🔒</span>
            <div className="lc-content">
              <h2 className="lc-title">Log In to Your Account</h2>
              <p className="lc-description">
                Already a member? Sign in to view your account.
              </p>
            </div>
            <span className="lc-arrow">→</span>
          </button>
        </div>
      </main>
    </div>
  );
}
