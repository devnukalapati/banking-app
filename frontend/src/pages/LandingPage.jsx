import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import CardArt from '../components/CardArt';
import { CREDIT_CARDS } from '../data/creditCards';
import { getCreditCards } from '../services/creditCardApi';
import './LandingPage.css';

export default function LandingPage({ onApply, onLogin }) {
  const [cards, setCards] = useState(CREDIT_CARDS);

  useEffect(() => {
    getCreditCards()
      .then((data) => { if (data.length > 0) setCards(data); })
      .catch(() => {});  // silent fallback to static data
  }, []);

  return (
    <div className="landing-page">
      <Banner />

      {/* Hero */}
      <div className="landing-hero">
        <h1 className="landing-headline">
          Find the card that's <span className="landing-accent">right for you</span>
        </h1>
        <p className="landing-tagline">
          Compare NexaBank credit cards and apply in minutes.
          Already a member?{' '}
          <button className="landing-login-link" onClick={onLogin}>
            Sign in →
          </button>
        </p>
      </div>

      {/* Card catalog */}
      <div className="landing-catalog">
        {cards.map((card) => (
          <div key={card.id} className="cc-row">
            {/* Card art */}
            <div className="cc-art-wrap">
              <CardArt card={card} size="md" />
            </div>

            {/* Product details */}
            <div className="cc-details">
              <div className="cc-header">
                <div>
                  <h2 className="cc-name">{card.name}</h2>
                  <p className="cc-tagline">{card.tagline}</p>
                </div>
                <div className="cc-meta">
                  <div className="cc-meta-item">
                    <span className="cc-meta-label">Annual Fee</span>
                    <span className="cc-meta-value">{card.annualFee}</span>
                  </div>
                  <div className="cc-meta-item">
                    <span className="cc-meta-label">APR</span>
                    <span className="cc-meta-value">{card.apr}</span>
                  </div>
                </div>
              </div>

              <ul className="cc-offers">
                {card.offers.map((offer, i) => (
                  <li key={i} className="cc-offer-item">
                    <span className="cc-offer-icon">{offer.icon}</span>
                    <span className="cc-offer-text">{offer.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="cc-cta">
              <button
                className="btn-apply-now"
                onClick={() => onApply(card)}
              >
                Apply Now →
              </button>
              <p className="cc-cta-note">No impact to credit score to check eligibility</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="landing-footer">
        <p>
          Already have a NexaBank account?{' '}
          <button className="landing-login-link" onClick={onLogin}>
            Log in to your account →
          </button>
        </p>
        <p className="landing-footer-admin">
          <Link to="/admin/login" className="landing-admin-link">Admin Portal</Link>
        </p>
      </footer>
    </div>
  );
}
