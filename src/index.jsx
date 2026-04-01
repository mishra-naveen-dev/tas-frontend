import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { NotificationProvider } from './contexts/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </NotificationProvider>
  </React.StrictMode>
);