import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Redirector = () => {
    const { user, userRole, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (userRole === 'EMPLOYEE') {
        return <Navigate to="/employee/dashboard" replace />;
    }

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/unauthorized" replace />;
};

export default Redirector;