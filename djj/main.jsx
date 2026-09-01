import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Log to console to verify React is loading
console.log('React app mounted')
