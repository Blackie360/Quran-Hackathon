export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Quran Backend</h1>
      <p>This Next.js app proxies requests for <code>/auth-api</code> and <code>/content-api</code>.</p>
      <p>Start this server and point your Angular frontend proxy at <code>http://localhost:3001</code>.</p>
    </main>
  );
}
