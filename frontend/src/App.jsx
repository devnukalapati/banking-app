import { useState } from 'react';
import Banner from './components/Banner';
import CustomerForm from './components/CustomerForm';
import ApprovedPage from './pages/ApprovedPage';
import PendingPage from './pages/PendingPage';
import DeclinedPage from './pages/DeclinedPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import MfaPage from './pages/MfaPage';
import WelcomePage from './pages/WelcomePage';

export default function App() {
  const [step, setStep]                     = useState('form');
  const [applicationData, setApplicationData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  function handleApplicationSuccess(data) {
    setApplicationData(data);
    setStep(data.applicationStatus.toLowerCase()); // 'approved' | 'pending' | 'declined'
  }

  function handleReset() {
    setStep('form');
    setApplicationData(null);
    setRegistrationData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switch (step) {
    case 'approved':
      return (
        <ApprovedPage
          data={applicationData}
          onProceed={() => setStep('registration')}
          onReset={handleReset}
        />
      );
    case 'pending':
      return <PendingPage data={applicationData} onReset={handleReset} />;

    case 'declined':
      return <DeclinedPage data={applicationData} onReset={handleReset} />;

    case 'registration':
      return (
        <UserRegistrationPage
          applicationData={applicationData}
          onSuccess={(data) => { setRegistrationData(data); setStep('mfa'); }}
          onReset={handleReset}
        />
      );

    case 'mfa':
      return (
        <MfaPage
          registrationData={registrationData}
          applicationData={applicationData}
          onSuccess={() => setStep('welcome')}
          onReset={handleReset}
        />
      );

    case 'welcome':
      return (
        <WelcomePage
          registrationData={registrationData}
          applicationData={applicationData}
          onReset={handleReset}
        />
      );

    default:
      return (
        <div className="app-layout">
          <Banner />
          <main className="app-main">
            <CustomerForm onSuccess={handleApplicationSuccess} />
          </main>
        </div>
      );
  }
}
