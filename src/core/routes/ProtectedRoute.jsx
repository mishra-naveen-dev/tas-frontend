import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'modules/auth/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {

    const {
        isAuthenticated,
        loading,
        user,
        userRole
    } = useAuth();

    const location = useLocation();

    // ================= LOADING =================
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // ================= NOT AUTH =================
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // ================= FORCE PASSWORD =================
    if (

        user &&
        user.force_password_change === true &&
        location.pathname !== '/change-password'
    ) {
        return <Navigate to="/change-password" replace />;
    }

    // ================= ROLE NORMALIZATION =================
    const role = String(
        userRole ||
        user?.role_name ||
        user?.role
    ).toUpperCase();

    const allowedRoles = (requiredRoles || []).map(r => r.toUpperCase());

    // ================= ROLE CHECK =================
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // ================= SUCCESS =================
    return children;
};

export default ProtectedRoute;