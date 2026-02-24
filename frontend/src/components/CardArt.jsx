import './CardArt.css';

export default function CardArt({ card, size = 'md' }) {
  return (
    <div className={`card-art card-art--${size}`} style={{ background: card.gradient }}>
      <div className="ca-top-row">
        <span className="ca-bank-name">NexaBank</span>
        <span className="ca-chip" style={{ background: card.chipColor }}>
          <span className="ca-chip-lines" />
        </span>
      </div>

      <div className="ca-number">
        •••• &nbsp;•••• &nbsp;•••• &nbsp;{card.numberSuffix}
      </div>

      <div className="ca-bottom-row">
        <div className="ca-expiry">
          <span className="ca-expiry-label">VALID THRU</span>
          <span className="ca-expiry-value">12 / 28</span>
        </div>
        <span className={`ca-network ca-network--${card.network.toLowerCase()}`}>
          {card.network === 'MASTERCARD' ? (
            <span className="ca-mc-circles">
              <span className="ca-mc-left" />
              <span className="ca-mc-right" />
            </span>
          ) : (
            <span className="ca-visa">VISA</span>
          )}
        </span>
      </div>
    </div>
  );
}
