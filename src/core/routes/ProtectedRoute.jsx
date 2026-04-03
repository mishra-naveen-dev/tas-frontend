import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'modules/auth/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles }) => {
    const { isAuthenticated, loading, user, userRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ✅ FORCE PASSWORD CHANGE (GLOBAL FIX)
    if (
        user?.force_password_change &&
        location.pathname !== '/change-password'
    ) {
        return <Navigate to="/change-password" replace />;
    }

    // ROLE CHECK
    if (requiredRoles && !requiredRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};
export default ProtectedRoute;