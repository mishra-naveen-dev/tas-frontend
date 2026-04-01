import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { userRole } = useAuth();

    useEffect(() => {
        // Redirect to role-based dashboard
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'EMPLOYEE') {
            navigate('/employee/dashboard', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [userRole, navigate]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );
};

export default DashboardPage;
