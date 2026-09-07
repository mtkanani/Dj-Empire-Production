import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Wake up Render's free-tier backend immediately on page load.
// Render spins down idle services after 15 min; the first request
// can take 30–60 s. Pinging /health early hides that cold-start
// latency before the user interacts with any form or button.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
fetch(`${API_BASE}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {
  // Silently ignore — this is just a warm-up ping.
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
