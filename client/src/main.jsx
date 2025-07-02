import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import Bootstrap's CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// VERY IMPORTANT: Import Bootstrap's JavaScript bundle for dropdowns, etc.
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import our custom classic styles (must come after Bootstrap)
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);