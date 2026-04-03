import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,

    Alert,
    TableContainer,
    Paper,
    Chip,
    Skeleton,
    Grid
} from '@mui/material';

import api from 'core/services/api';

const AdminPunchDetails = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ SAFE HELPERS
    const safe = (v) => Number(v) || 0;

    const safeDistance = (v) => {
        if (v === null || v === undefined) return "0.00";
        return Number(v).toFixed(2);
    };

    const safeAmount = (v) => {
        if (!v) return "0.00";
        return Number(v).toFixed(2);
    };

    // ================= FETCH =================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.getPunchRecords();
            setData(res.data.results || res.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // ================= SUMMARY =================
    const summary = useMemo(() => ({
        totalPunches: data.length,
        totalDistance: data.reduce((sum, p) => sum + safe(p.distance_from_last), 0),
        totalCollection: data.reduce((sum, p) => sum + safe(p.amount), 0),
    }), [data]);

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h4" gutterBottom>
                Employee Punch Details
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ================= SUMMARY CARDS ================= */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                    { label: 'Total Punch', value: summary.totalPunches },
                    { label: 'Total Distance', value: `${safeDistance(summary.totalDistance)} km` },
                    { label: 'Total Collection', value: `₹ ${safeAmount(summary.totalCollection)}` }
                ].map((item, i) => (
                    <Grid item xs={6} md={3} key={i}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2">{item.label}</Typography>

                                {loading ? (
                                    <Skeleton width={80} height={30} />
                                ) : (
                                    <Typography variant="h6">{item.value}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ================= TABLE ================= */}
            <Card>
                <CardContent>

                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: 500,
                            overflow: 'auto'
                        }}
                    >
                        <Table stickyHeader size="small">

                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Distance</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Visit</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Travel</TableCell>
                                    <TableCell>Address</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={9}>
                                                <Skeleton height={30} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            No data found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((p) => (
                                        <TableRow key={p.id} hover>

                                            <TableCell>
                                                {p.employee_details?.first_name || p.employee}
                                            </TableCell>

                                            <TableCell>
                                                {p.punched_at
                                                    ? new Date(p.punched_at).toLocaleString()
                                                    : '--'}
                                            </TableCell>

                                            {/* PUNCH TYPE */}
                                            <TableCell>
                                                <Chip
                                                    label={p.punch_type || 'N/A'}
                                                    color={p.punch_type === 'PUNCH_IN' ? 'success' : 'primary'}
                                                    size="small"
                                                />
                                            </TableCell>

                                            {/* DISTANCE */}
                                            <TableCell>
                                                {safeDistance(p.distance_from_last)} km
                                            </TableCell>

                                            {/* TOTAL DISTANCE */}
                                            <TableCell>
                                                {safeDistance(p.total_distance_day)} km
                                            </TableCell>

                                            {/* VISIT TYPE */}
                                            <TableCell>
                                                <Chip
                                                    label={p.visit_type || 'N/A'}
                                                    color={
                                                        p.visit_type === 'COLLECTION'
                                                            ? 'success'
                                                            : p.visit_type === 'DISBURSEMENT'
                                                                ? 'error'
                                                                : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>

                                            {/* AMOUNT */}
                                            <TableCell>
                                                ₹ {safeAmount(p.amount)}
                                            </TableCell>

                                            {/* TRAVEL */}
                                            <TableCell>
                                                {p.travel_with === 'WITH_EMPLOYEE'
                                                    ? p.co_employee_name || 'With Employee'
                                                    : 'Alone'}
                                            </TableCell>

                                            {/* ADDRESS */}
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Current:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {p.current_address || '--'}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    Customer:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {p.customer_address || '--'}
                                                </Typography>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </TableContainer>

                </CardContent>
            </Card>

        </Box>
    );
};

export default AdminPunchDetails;