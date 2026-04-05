import Lobby from '../components/Lobby';

export default function Home() {
  return (
    <main
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: '100vh',
      }}
    >
      <Lobby />
    </main>
  );
}
