import { useState } from 'react';
import PersonalDetails from './form/PersonalDetails';
import AddressDetails from './form/AddressDetails';
import EmploymentDetails from './form/EmploymentDetails';
import FinancialInfo from './form/FinancialInfo';
import SSNInput from './form/SSNInput';
import CardArt from './CardArt';
import { submitCustomer } from '../services/customerApi';
import './CustomerForm.css';

const INITIAL_STATE = {
  // Personal
  firstName: '', lastName: '', dateOfBirth: '', email: '', phone: '',
  // Address
  streetAddress: '', city: '', state: '', zipCode: '', country: 'United States',
  // Employment
  employmentStatus: '', employerName: '', jobTitle: '', yearsEmployed: '', annualSalary: '',
  // Financial
  incomeSource: '', accountType: '', creditScoreRange: '',
  // SSN
  ssn: '',
};

function validate(data) {
  const errors = {};
  if (!data.firstName.trim())     errors.firstName = 'First name is required';
  if (!data.lastName.trim())      errors.lastName = 'Last name is required';
  if (!data.dateOfBirth)          errors.dateOfBirth = 'Date of birth is required';
  if (!data.email.trim())         errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                                  errors.email = 'Invalid email address';
  if (!data.phone.trim())         errors.phone = 'Phone number is required';
  if (!data.streetAddress.trim()) errors.streetAddress = 'Street address is required';
  if (!data.city.trim())          errors.city = 'City is required';
  if (!data.state)                errors.state = 'State is required';
  if (!data.zipCode.trim())       errors.zipCode = 'Zip code is required';
  else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode))
                                  errors.zipCode = 'Invalid zip code format';
  if (!data.country)              errors.country = 'Country is required';
  if (!data.employmentStatus)     errors.employmentStatus = 'Employment status is required';
  if (!data.ssn.trim())           errors.ssn = 'SSN is required';
  else if (!/^\d{3}-\d{2}-\d{4}$/.test(data.ssn))
                                  errors.ssn = 'SSN must be in format XXX-XX-XXXX';
  return errors;
}

function buildPayload(data) {
  return {
    firstName:        data.firstName.trim(),
    lastName:         data.lastName.trim(),
    dateOfBirth:      data.dateOfBirth,
    email:            data.email.trim(),
    phone:            data.phone.trim(),
    streetAddress:    data.streetAddress.trim(),
    city:             data.city.trim(),
    state:            data.state,
    zipCode:          data.zipCode.trim(),
    country:          data.country,
    employmentStatus: data.employmentStatus,
    employerName:     data.employerName.trim() || null,
    jobTitle:         data.jobTitle.trim() || null,
    yearsEmployed:    data.yearsEmployed !== '' ? Number(data.yearsEmployed) : null,
    annualSalary:     data.annualSalary !== '' ? Number(data.annualSalary) : null,
    incomeSource:     data.incomeSource || null,
    accountType:      data.accountType || null,
    creditScoreRange: data.creditScoreRange || null,
    ssn:              data.ssn,
  };
}

export default function CustomerForm({ onSuccess, selectedCard }) {
  const [formData, setFormData]     = useState(INITIAL_STATE);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotification(null);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorId = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitCustomer(buildPayload(formData));
      onSuccess(response);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Submission failed. Please try again.';
      const fieldErrors = err.response?.data?.fieldErrors || {};
      setErrors(fieldErrors);
      setNotification({ type: 'error', title: 'Submission failed', body: apiMessage });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData(INITIAL_STATE);
    setErrors({});
    setNotification(null);
  }

  return (
    <div className="form-container">
      {selectedCard && (
        <div className="selected-card-banner">
          <CardArt card={selectedCard} size="sm" />
          <div className="scb-info">
            <p className="scb-label">Applying for</p>
            <h2 className="scb-name">{selectedCard.name}</h2>
            <p className="scb-tagline">{selectedCard.tagline}</p>
            <ul className="scb-offers">
              {selectedCard.offers.slice(0, 3).map((offer, i) => (
                <li key={i}>
                  <span>{offer.icon}</span> {offer.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="form-heading">
        <h1>Customer Registration</h1>
        <p>Complete all required fields to open your NexaBank account.</p>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <div className="notification-body">
            <strong>{notification.title}</strong>
            <span>{notification.body}</span>
          </div>
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <PersonalDetails data={formData} errors={errors} onChange={handleChange} />
        <AddressDetails  data={formData} errors={errors} onChange={handleChange} />
        <EmploymentDetails data={formData} errors={errors} onChange={handleChange} />
        <FinancialInfo   data={formData} errors={errors} onChange={handleChange} />
        <SSNInput value={formData.ssn} error={errors.ssn} onChange={handleChange} />

        <div className="form-footer">
          <button type="button" className="btn-reset" onClick={handleReset}>
            Clear Form
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <><span className="spinner" /> Submitting…</>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
