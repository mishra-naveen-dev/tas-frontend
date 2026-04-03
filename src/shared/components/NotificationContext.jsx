import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

    const [state, setState] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showNotification = (message, severity = 'success') => {
        setState({
            open: true,
            message,
            severity
        });
    };

    const handleClose = () => {
        setState(prev => ({ ...prev, open: false }));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* 🔥 GLOBAL SNACKBAR */}
            <Snackbar
                open={state.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={state.severity}
                    variant="filled"
                >
                    {state.message}
                </Alert>
            </Snackbar>

        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);