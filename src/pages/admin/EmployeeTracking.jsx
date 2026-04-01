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
    Typography,
    Chip,
} from '@mui/material';

import api from '../../services/api';

const EmployeeTracking = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.getUsers({
                role_name: 'EMPLOYEE',
            });

            setEmployees(response.data.results || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Better Loader UI
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Employee Tracking
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Area</TableCell>
                            <TableCell>Center</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>{employee.employee_id || '-'}</TableCell>

                                <TableCell>
                                    {employee.first_name || ''} {employee.last_name || ''}
                                </TableCell>

                                <TableCell>{employee.designation || '-'}</TableCell>
                                <TableCell>{employee.area_name || '-'}</TableCell>
                                <TableCell>{employee.center_name || '-'}</TableCell>
                                <TableCell>{employee.phone || '-'}</TableCell>

                                <TableCell>
                                    <Chip
                                        label={employee.is_active ? 'Active' : 'Inactive'}
                                        color={employee.is_active ? 'success' : 'error'}
                                        variant="outlined"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {employees.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No employees found.
                </Alert>
            )}
        </Box>
    );
};

export default EmployeeTracking;