import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Production: point API calls to Railway backend
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
