import React, { useEffect, useState, useCallback } from 'react';
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
    TextField,
    Button,
    Chip,
    Typography,
    Grid,
    Card,
    CardContent,
    Skeleton
} from '@mui/material';

import api from '../../services/api';

const PunchHistory = () => {
    const [punches, setPunches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterDate, setFilterDate] = useState(
        new Date().toISOString().split('T')[0]
    );

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
    const fetchPunches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.getPunchRecords({
                punch_date: filterDate,
            });

            const data = response?.data?.results || response?.data || [];
            setPunches(data);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load punch records');
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchPunches();
        }, 400); // debounce

        return () => clearTimeout(delay);
    }, [filterDate, fetchPunches]);

    // ================= SUMMARY =================
    const totalDistance = punches.reduce(
        (sum, p) => sum + safe(p.distance_from_last),
        0
    );

    const totalCollection = punches.reduce(
        (sum, p) => sum + safe(p.amount),
        0
    );

    return (
        <Box sx={{ p: 3, maxWidth: '100%', overflowX: 'hidden' }}>

            {/* ================= FILTER ================= */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    size="small"
                />

                <Button variant="contained" onClick={fetchPunches}>
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ================= SUMMARY ================= */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Punch', value: punches.length },
                    { label: 'Total Distance', value: `${safeDistance(totalDistance)} km` },
                    { label: 'Collection', value: `₹ ${safeAmount(totalCollection)}` }
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
            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 500,
                    overflow: 'auto'
                }}
            >
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Distance</TableCell>
                            <TableCell>Total</TableCell> {/* ✅ NEW */}
                            <TableCell>Amount</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={8}>
                                        <Skeleton height={30} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : punches.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No punch records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            punches.map((punch) => (
                                <TableRow key={punch.id} hover>

                                    <TableCell>
                                        {punch.punched_at
                                            ? new Date(punch.punched_at).toLocaleDateString()
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        {punch.punched_at
                                            ? new Date(punch.punched_at).toLocaleTimeString()
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={punch.punch_type || 'N/A'}
                                            color={punch.punch_type === 'PUNCH_IN' ? 'success' : 'primary'}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell sx={{ maxWidth: 180 }}>
                                        {punch.latitude && punch.longitude
                                            ? `${Number(punch.latitude).toFixed(5)}, ${Number(punch.longitude).toFixed(5)}`
                                            : 'No location'}
                                    </TableCell>

                                    <TableCell>
                                        {safeDistance(punch.distance_from_last)} km
                                    </TableCell>

                                    <TableCell>
                                        {safeDistance(punch.total_distance_day)} km
                                    </TableCell>

                                    <TableCell>
                                        ₹ {safeAmount(punch.amount)}
                                    </TableCell>

                                    <TableCell>
                                        {punch.notes || '--'}
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
};

export default PunchHistory;