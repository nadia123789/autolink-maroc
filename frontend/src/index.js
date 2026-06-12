import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/index.js';   // initialiser i18n AVANT App
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
