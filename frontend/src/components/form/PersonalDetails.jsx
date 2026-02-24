export default function PersonalDetails({ data, errors, onChange }) {
  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon">👤</span>
        <h2 className="section-title">Personal Details</h2>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="firstName">First Name <span className="required">*</span></label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={data.firstName}
            onChange={onChange}
            placeholder="Jane"
            autoComplete="given-name"
            className={errors.firstName ? 'input-error' : ''}
          />
          {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
        </div>

        <div className="field">
          <label htmlFor="lastName">Last Name <span className="required">*</span></label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={data.lastName}
            onChange={onChange}
            placeholder="Smith"
            autoComplete="family-name"
            className={errors.lastName ? 'input-error' : ''}
          />
          {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
        </div>

        <div className="field">
          <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={onChange}
            max={new Date().toISOString().split('T')[0]}
            className={errors.dateOfBirth ? 'input-error' : ''}
          />
          {errors.dateOfBirth && <span className="error-msg">{errors.dateOfBirth}</span>}
        </div>

        <div className="field field-span-2">
          <label htmlFor="email">Email Address <span className="required">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            placeholder="jane.smith@example.com"
            autoComplete="email"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone Number <span className="required">*</span></label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={data.phone}
            onChange={onChange}
            placeholder="+1-800-555-0199"
            autoComplete="tel"
            className={errors.phone ? 'input-error' : ''}
          />
          {errors.phone && <span className="error-msg">{errors.phone}</span>}
        </div>
      </div>
    </section>
  );
}
