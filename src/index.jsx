import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NotificationProvider } from 'shared/components/NotificationContext';
import { HashRouter } from 'react-router-dom';

console.log("APP STARTED");

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HashRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </HashRouter>
  </React.StrictMode>
);