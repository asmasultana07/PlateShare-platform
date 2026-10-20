
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <>
      <Navbar />

      <main className="container" style={{ paddingBlock: '80px' }}>
        <p style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          Welcome to PlateShare
        </p>

        <h1>Good food. Shared with care.</h1>

        <p style={{ color: 'var(--color-muted)' }}>
          Connecting surplus food with people who need it.
        </p>
      </main>
    </>
  );
}

export default App;
