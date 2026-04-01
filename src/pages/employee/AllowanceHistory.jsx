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
    Button,
} from '@mui/material';
import api from '../../services/api';


const AllowanceHistory = () => {
    const [allowances, setAllowances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllowances();
    }, []);

    const fetchAllowances = async () => {
        try {
            setLoading(true);
            const response = await api.getAllowanceRequests();
            setAllowances(response.data.results || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load allowance history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT':
                return 'default';
            case 'SUBMITTED':
                return 'info';
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'error';
            case 'PAID':
                return 'success';
            default:
                return 'default';
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Date</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell>Distance (km)</TableCell>

                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allowances.map((allowance) => (
                            <TableRow key={allowance.id}>
                                <TableCell>{new Date(allowance.travel_date).toLocaleDateString()}</TableCell>
                                <TableCell>{allowance.from_location}</TableCell>
                                <TableCell>{allowance.to_location}</TableCell>
                                <TableCell>{allowance.total_distance}Km</TableCell>

                                <TableCell>
                                    <Chip
                                        label={allowance.status}
                                        variant="outlined"
                                        color={getStatusColor(allowance.status)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined">
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {allowances.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No allowance requests found.
                </Alert>
            )}
        </Box>
    );
};

export default AllowanceHistory;
