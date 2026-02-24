import './Banner.css';

export default function Banner() {
  return (
    <header>
      <div className="banner">
        <div className="banner-inner">
          <div className="banner-logo">
            <div className="logo-mark">N</div>
            <div className="logo-text">
              <span className="logo-name">NexaBank</span>
              <span className="logo-tagline">Your Trusted Financial Partner</span>
            </div>
          </div>

          <nav className="banner-nav">
            <span className="banner-nav-link">Personal Banking</span>
            <span className="banner-nav-link">Business</span>
            <span className="banner-nav-link">Investments</span>
            <span className="banner-nav-link">Support</span>
          </nav>
        </div>
      </div>
      <div className="banner-accent" />
    </header>
  );
}
