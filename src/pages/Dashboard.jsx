import React from 'react';
import { Container, Typography } from '@mui/material';

const Dashboard = () => {
    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1">
                Welcome to the Traveling Allowance System Dashboard!
            </Typography>
        </Container>
    );
};

export default Dashboard;
