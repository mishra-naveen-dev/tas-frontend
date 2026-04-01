import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
                Unauthorized
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                You don't have permission to access this page.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
            </Button>
        </Box>
    );
};

export default Unauthorized;

