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
  const [step, setStep]                       = useState('landing');
  const [selectedCard, setSelectedCard]       = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [loginData, setLoginData]             = useState(null);

  function handleApplicationSuccess(data) {
    setApplicationData(data);
    setStep(data.applicationStatus.toLowerCase()); // 'approved' | 'pending' | 'declined'
  }

  function handleReset() {
    setStep('landing');
    setSelectedCard(null);
    setApplicationData(null);
    setRegistrationData(null);
    setLoginData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switch (step) {
    case 'landing':
      return (
        <LandingPage
          onApply={(card) => { setSelectedCard(card); setStep('form'); }}
          onLogin={() => setStep('login')}
        />
      );

    case 'login':
      return (
        <LoginPage
          onSuccess={(data) => { setLoginData(data); setStep('login-mfa'); }}
          onBack={() => setStep('landing')}
          onHome={handleReset}
        />
      );

    case 'login-mfa':
      return (
        <MfaPage
          mode="login"
          registrationData={loginData}
          onSuccess={() => setStep('dashboard')}
          onReset={handleReset}
          onHome={handleReset}
        />
      );

    case 'dashboard':
      return (
        <DashboardPage
          loginData={loginData}
          onSignOut={handleReset}
          onHome={handleReset}
        />
      );

    case 'approved':
      return (
        <ApprovedPage
          data={applicationData}
          onProceed={() => setStep('registration')}
          onReset={handleReset}
          onHome={handleReset}
        />
      );

    case 'pending':
      return <PendingPage data={applicationData} onReset={handleReset} onHome={handleReset} />;

    case 'declined':
      return <DeclinedPage data={applicationData} onReset={handleReset} onHome={handleReset} />;

    case 'registration':
      return (
        <UserRegistrationPage
          applicationData={applicationData}
          onSuccess={(data) => { setRegistrationData(data); setStep('mfa'); }}
          onReset={handleReset}
          onHome={handleReset}
        />
      );

    case 'mfa':
      return (
        <MfaPage
          registrationData={registrationData}
          applicationData={applicationData}
          onSuccess={() => {
            setLoginData({
              userId:            registrationData.userId,
              username:          registrationData.username,
              customerId:        registrationData.customerId,
              firstName:         applicationData.firstName,
              lastName:          applicationData.lastName,
              applicationStatus: applicationData.applicationStatus,
              cardProduct:       applicationData.cardProduct,
              mfaVerified:       true,
            });
            setStep('welcome');
          }}
          onReset={handleReset}
          onHome={handleReset}
        />
      );

    case 'welcome':
      return (
        <WelcomePage
          registrationData={registrationData}
          applicationData={applicationData}
          onDashboard={() => setStep('dashboard')}
          onReset={handleReset}
          onHome={handleReset}
        />
      );

    default:
      return (
        <div className="app-layout">
          <Banner onHome={handleReset} />
          <main className="app-main">
            <CustomerForm
              onSuccess={handleApplicationSuccess}
              selectedCard={selectedCard}
            />
          </main>
        </div>
      );
  }
}
