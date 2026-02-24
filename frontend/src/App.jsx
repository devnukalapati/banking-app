import { useState } from 'react';
import Banner from './components/Banner';
import CustomerForm from './components/CustomerForm';
import ApprovedPage from './pages/ApprovedPage';
import PendingPage from './pages/PendingPage';
import DeclinedPage from './pages/DeclinedPage';

export default function App() {
  const [result, setResult] = useState(null);

  function handleReset() {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (result?.applicationStatus === 'APPROVED') {
    return <ApprovedPage data={result} onReset={handleReset} />;
  }
  if (result?.applicationStatus === 'PENDING') {
    return <PendingPage data={result} onReset={handleReset} />;
  }
  if (result?.applicationStatus === 'DECLINED') {
    return <DeclinedPage data={result} onReset={handleReset} />;
  }

  return (
    <div className="app-layout">
      <Banner />
      <main className="app-main">
        <CustomerForm onSuccess={setResult} />
      </main>
    </div>
  );
}
