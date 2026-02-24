const EMPLOYMENT_STATUSES = [
  { value: 'EMPLOYED',      label: 'Employed (Full-Time)' },
  { value: 'PART_TIME',     label: 'Employed (Part-Time)' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED',    label: 'Unemployed' },
  { value: 'RETIRED',       label: 'Retired' },
  { value: 'STUDENT',       label: 'Student' },
];

export default function EmploymentDetails({ data, errors, onChange }) {
  const isEmployed = ['EMPLOYED', 'PART_TIME', 'SELF_EMPLOYED'].includes(data.employmentStatus);

  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon">💼</span>
        <h2 className="section-title">Employment</h2>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="employmentStatus">
            Employment Status <span className="required">*</span>
          </label>
          <select
            id="employmentStatus"
            name="employmentStatus"
            value={data.employmentStatus}
            onChange={onChange}
            className={errors.employmentStatus ? 'input-error' : ''}
          >
            <option value="">Select status</option>
            {EMPLOYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.employmentStatus && (
            <span className="error-msg">{errors.employmentStatus}</span>
          )}
        </div>

        <div className="field field-span-2">
          <label htmlFor="employerName">Employer / Business Name</label>
          <input
            id="employerName"
            name="employerName"
            type="text"
            value={data.employerName}
            onChange={onChange}
            placeholder={isEmployed ? 'Acme Corporation' : ''}
            disabled={!isEmployed}
          />
        </div>

        <div className="field">
          <label htmlFor="jobTitle">Job Title</label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            value={data.jobTitle}
            onChange={onChange}
            placeholder={isEmployed ? 'Senior Analyst' : ''}
            disabled={!isEmployed}
          />
        </div>

        <div className="field">
          <label htmlFor="yearsEmployed">Years Employed</label>
          <input
            id="yearsEmployed"
            name="yearsEmployed"
            type="number"
            min="0"
            max="60"
            value={data.yearsEmployed}
            onChange={onChange}
            placeholder="0"
            disabled={!isEmployed}
            className={errors.yearsEmployed ? 'input-error' : ''}
          />
          {errors.yearsEmployed && (
            <span className="error-msg">{errors.yearsEmployed}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="annualSalary">Annual Salary (USD)</label>
          <div className="input-prefix-wrap">
            <span className="input-prefix">$</span>
            <input
              id="annualSalary"
              name="annualSalary"
              type="number"
              min="0"
              step="1000"
              value={data.annualSalary}
              onChange={onChange}
              placeholder="75,000"
              className={`input-with-prefix${errors.annualSalary ? ' input-error' : ''}`}
            />
          </div>
          {errors.annualSalary && (
            <span className="error-msg">{errors.annualSalary}</span>
          )}
        </div>
      </div>
    </section>
  );
}
