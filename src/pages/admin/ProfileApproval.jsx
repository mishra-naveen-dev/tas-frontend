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
    Button,
    Chip,
    Typography,
    CircularProgress,
} from '@mui/material';
import api from '../../services/api';
import AppLayout from '../../components/AppLayout';

const ProfileApproval = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.getProfileRequests();
            setData(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        await api.approveProfile(id);
        fetchData();
    };

    const handleReject = async (id) => {
        await api.rejectProfile(id);
        fetchData();
    };

    const getColor = (status) => {
        if (status === 'PENDING') return 'warning';
        if (status === 'APPROVED') return 'success';
        if (status === 'REJECTED') return 'error';
        return 'default';
    };

    if (loading) {
        return (
            <AppLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Box sx={{ p: 3 }}>

                {/* HEADER */}
                <Typography variant="h4" gutterBottom>
                    Profile Update Requests
                </Typography>

                {/* TABLE */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Designation</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => (
                                    <TableRow key={row.id} hover>

                                        <TableCell>
                                            <Typography fontWeight={500}>
                                                {row.user_details?.first_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {row.user_details?.employee_id}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>{row.phone || '-'}</TableCell>

                                        <TableCell>{row.designation || '-'}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={getColor(row.status)}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.status === 'PENDING' && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleApprove(row.id)}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleReject(row.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>

            </Box>
        </AppLayout>
    );
};

export default ProfileApproval;