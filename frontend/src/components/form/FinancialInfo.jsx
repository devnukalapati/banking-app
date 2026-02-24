const INCOME_SOURCES = [
  { value: 'EMPLOYMENT',  label: 'Employment / Salary' },
  { value: 'BUSINESS',    label: 'Business Income' },
  { value: 'INVESTMENTS', label: 'Investments / Dividends' },
  { value: 'RENTAL',      label: 'Rental Income' },
  { value: 'PENSION',     label: 'Pension / Retirement' },
  { value: 'GOVERNMENT',  label: 'Government Benefits' },
  { value: 'OTHER',       label: 'Other' },
];

const ACCOUNT_TYPES = [
  { value: 'CHECKING',      label: 'Checking Account' },
  { value: 'SAVINGS',       label: 'Savings Account' },
  { value: 'MONEY_MARKET',  label: 'Money Market' },
  { value: 'CD',            label: 'Certificate of Deposit (CD)' },
  { value: 'NONE',          label: 'No Existing Account' },
];

const CREDIT_RANGES = [
  { value: '800-850', label: 'Exceptional (800–850)' },
  { value: '740-799', label: 'Very Good (740–799)' },
  { value: '670-739', label: 'Good (670–739)' },
  { value: '580-669', label: 'Fair (580–669)' },
  { value: '300-579', label: 'Poor (300–579)' },
  { value: 'UNKNOWN', label: 'I don\'t know' },
];

export default function FinancialInfo({ data, errors, onChange }) {
  return (
    <section className="form-section">
      <div className="section-header">
        <span className="section-icon">💰</span>
        <h2 className="section-title">Financial Information</h2>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="incomeSource">Primary Income Source</label>
          <select
            id="incomeSource"
            name="incomeSource"
            value={data.incomeSource}
            onChange={onChange}
          >
            <option value="">Select source</option>
            {INCOME_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="accountType">Account Type</label>
          <select
            id="accountType"
            name="accountType"
            value={data.accountType}
            onChange={onChange}
          >
            <option value="">Select account type</option>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="creditScoreRange">Credit Score Range</label>
          <select
            id="creditScoreRange"
            name="creditScoreRange"
            value={data.creditScoreRange}
            onChange={onChange}
          >
            <option value="">Select range</option>
            {CREDIT_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
