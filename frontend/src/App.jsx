import Banner from './components/Banner';
import CustomerForm from './components/CustomerForm';

export default function App() {
  return (
    <div className="app-layout">
      <Banner />
      <main className="app-main">
        <CustomerForm />
      </main>
    </div>
  );
}
