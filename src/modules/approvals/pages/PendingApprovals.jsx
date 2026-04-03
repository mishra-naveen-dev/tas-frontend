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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import api from 'core/services/api';

const PendingApprovals = () => {
    const [allowances, setAllowances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAllowance, setSelectedAllowance] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // ================= FETCH =================
    const fetchPending = async () => {
        try {
            setLoading(true);

            const res = await api.getPendingApprovals();
            const data = res.data;

            setAllowances(data.results || data || []);

        } catch (err) {
            console.error(err);
            setError('Failed to load approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    // ================= ACTIONS =================
    const handleApprove = async (id) => {
        try {
            setActionLoading(true);
            await api.approveAllowanceRequest(id);
            fetchPending();
        } catch {
            setError('Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectClick = (allowance) => {
        setSelectedAllowance(allowance);
        setOpenDialog(true);
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);

            await api.rejectAllowanceRequest(selectedAllowance.id, {
                reason: rejectionReason,
            });

            setOpenDialog(false);
            setRejectionReason('');
            fetchPending();

        } catch {
            setError('Failed to reject request');
        } finally {
            setActionLoading(false);
        }
    };

    // ================= HELPERS =================
    const getStatusColor = (status) => {
        if (status === 'PENDING') return 'warning';
        if (status === 'APPROVED') return 'success';
        if (status === 'REJECTED') return 'error';
        return 'default';
    };

    const safe = (v) => Number(v) || 0;

    // ================= SUMMARY =================
    const totalAmount = allowances.reduce(
        (sum, a) => sum + safe(a.total_amount),
        0
    );

    const totalDistance = allowances.reduce(
        (sum, a) => sum + safe(a.total_distance),
        0
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" gutterBottom>
                Pending Allowance Approvals
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ================= SUMMARY CARDS ================= */}
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Total Requests</Typography>
                            <Typography variant="h5">{allowances.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Total Distance</Typography>
                            <Typography variant="h5">
                                {totalDistance.toFixed(2)} km
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Total Amount</Typography>
                            <Typography variant="h5">
                                ₹ {totalAmount.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ================= TABLE ================= */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>#</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Route</TableCell>
                            <TableCell>Distance</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {allowances.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No pending approvals
                                </TableCell>
                            </TableRow>
                        ) : (
                            allowances.map((a, index) => (
                                <TableRow key={a.id} hover>

                                    <TableCell>{index + 1}</TableCell>

                                    <TableCell>
                                        {a.employee_details?.first_name || '-'}{' '}
                                        {a.employee_details?.last_name || ''}
                                    </TableCell>

                                    <TableCell>
                                        {a.travel_date
                                            ? new Date(a.travel_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>

                                    <TableCell>
                                        {a.from_location} → {a.to_location}
                                    </TableCell>

                                    <TableCell>
                                        {safe(a.total_distance).toFixed(2)} km
                                    </TableCell>

                                    <TableCell>
                                        ₹ {safe(a.total_amount).toFixed(2)}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={a.status}
                                            color={getStatusColor(a.status)}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            color="success"
                                            variant="contained"
                                            onClick={() => handleApprove(a.id)}
                                            disabled={actionLoading}
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                            onClick={() => handleRejectClick(a)}
                                        >
                                            Reject
                                        </Button>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ================= REJECT DIALOG ================= */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Reject Request</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        color="error"
                        variant="contained"
                        disabled={!rejectionReason || actionLoading}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default PendingApprovals;