const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
];

export default function AddressDetails({ data, errors, onChange }) {
  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon">🏠</span>
        <h2 className="section-title">Address</h2>
      </div>

      <div className="field-grid">
        <div className="field field-full">
          <label htmlFor="streetAddress">Street Address <span className="required">*</span></label>
          <input
            id="streetAddress"
            name="streetAddress"
            type="text"
            value={data.streetAddress}
            onChange={onChange}
            placeholder="123 Main Street, Apt 4B"
            autoComplete="street-address"
            className={errors.streetAddress ? 'input-error' : ''}
          />
          {errors.streetAddress && <span className="error-msg">{errors.streetAddress}</span>}
        </div>

        <div className="field">
          <label htmlFor="city">City <span className="required">*</span></label>
          <input
            id="city"
            name="city"
            type="text"
            value={data.city}
            onChange={onChange}
            placeholder="New York"
            autoComplete="address-level2"
            className={errors.city ? 'input-error' : ''}
          />
          {errors.city && <span className="error-msg">{errors.city}</span>}
        </div>

        <div className="field">
          <label htmlFor="state">State <span className="required">*</span></label>
          <select
            id="state"
            name="state"
            value={data.state}
            onChange={onChange}
            className={errors.state ? 'input-error' : ''}
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <span className="error-msg">{errors.state}</span>}
        </div>

        <div className="field">
          <label htmlFor="zipCode">Zip Code <span className="required">*</span></label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            value={data.zipCode}
            onChange={onChange}
            placeholder="10001"
            maxLength={10}
            className={errors.zipCode ? 'input-error' : ''}
          />
          {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
        </div>

        <div className="field">
          <label htmlFor="country">Country <span className="required">*</span></label>
          <select
            id="country"
            name="country"
            value={data.country}
            onChange={onChange}
            className={errors.country ? 'input-error' : ''}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
          {errors.country && <span className="error-msg">{errors.country}</span>}
        </div>
      </div>
    </section>
  );
}
