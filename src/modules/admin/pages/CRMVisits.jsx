import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Chip,
    Typography,
} from '@mui/material';
import api from 'core/services/api';


const CRMVisits = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const response = await api.getLoanVisits();
            setVisits(response.data.results || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load loan visits');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                CRM Loan Visits
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Loan ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Visited By</TableCell>
                            <TableCell>Visit Date</TableCell>
                            <TableCell>Visit Type</TableCell>
                            <TableCell>Distance (km)</TableCell>
                            <TableCell>Follow-up</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visits.map((visit) => (
                            <TableRow key={visit.id}>
                                <TableCell>{visit.loan_details?.loan_id}</TableCell>
                                <TableCell>{visit.loan_details?.customer_name}</TableCell>
                                <TableCell>{visit.visited_by_details?.first_name} {visit.visited_by_details?.last_name}</TableCell>
                                <TableCell>{new Date(visit.visit_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip label={visit.visit_type} variant="outlined" size="small" />
                                </TableCell>
                                <TableCell>{visit.distance_traveled?.toFixed(2) || '--'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={visit.follow_up_required ? 'Yes' : 'No'}
                                        color={visit.follow_up_required ? 'warning' : 'success'}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {visits.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No loan visits found.
                </Alert>
            )}
        </Box>
    );
};

export default CRMVisits;
