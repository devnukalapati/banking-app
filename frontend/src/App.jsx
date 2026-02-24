import { useState } from 'react';
import Banner from './components/Banner';
import CustomerForm from './components/CustomerForm';
import ApprovedPage from './pages/ApprovedPage';
import PendingPage from './pages/PendingPage';
import DeclinedPage from './pages/DeclinedPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import MfaPage from './pages/MfaPage';
import WelcomePage from './pages/WelcomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [step, setStep]                     = useState('landing');
  const [applicationData, setApplicationData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [loginData, setLoginData]           = useState(null);

  function handleApplicationSuccess(data) {
    setApplicationData(data);
    setStep(data.applicationStatus.toLowerCase()); // 'approved' | 'pending' | 'declined'
  }

  function handleReset() {
    setStep('landing');
    setApplicationData(null);
    setRegistrationData(null);
    setLoginData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switch (step) {
    case 'landing':
      return (
        <LandingPage
          onApply={() => setStep('form')}
          onLogin={() => setStep('login')}
        />
      );

    case 'login':
      return (
        <LoginPage
          onSuccess={(data) => { setLoginData(data); setStep('dashboard'); }}
          onBack={() => setStep('landing')}
        />
      );

    case 'dashboard':
      return (
        <DashboardPage
          loginData={loginData}
          onSignOut={handleReset}
        />
      );

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
