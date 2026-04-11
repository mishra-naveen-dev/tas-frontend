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
    Alert,
    TextField,
    Button,
    Chip,
    Typography,
    Grid,
    Card,
    CardContent,
    Skeleton,
    Stack
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import api from 'core/services/api';
import { TableSkeleton } from 'shared/components/SkeletonLoader';

const PunchHistory = () => {

    const [punches, setPunches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterDate, setFilterDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // ================= HELPERS =================
    const safe = (v) => Number(v) || 0;

    const safeDistance = (v) =>
        v ? Number(v).toFixed(2) : "0.00";

    const safeAmount = (v) =>
        v ? Number(v).toFixed(2) : "0.00";

    // ================= FETCH =================
    const fetchPunches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.getPunchRecords({
                punch_date: filterDate,
            });

            const data = res?.data?.results || res?.data || [];
            setPunches(data);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load punch records');
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => {
        const timer = setTimeout(fetchPunches, 400);
        return () => clearTimeout(timer);
    }, [fetchPunches]);

    // ================= SUMMARY =================
    const totalDistance = punches.reduce(
        (sum, p) => sum + safe(p.distance_from_last),
        0
    );

    const totalCollection = punches.reduce(
        (sum, p) =>
            p.visit_type === 'COLLECTION'
                ? sum + safe(p.amount)
                : sum,
        0
    );

    const totalDisbursement = punches.reduce(
        (sum, p) =>
            p.visit_type === 'DISBURSEMENT'
                ? sum + safe(p.amount)
                : sum,
        0
    );

    return (
        <Box sx={{ p: 3 }}>

            {/* ================= HEADER ================= */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Punch History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track daily field movement and financial activity
                </Typography>
            </Box>

            {/* ================= FILTER ================= */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    size="small"
                />

                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={fetchPunches}
                >
                    Refresh
                </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ================= KPI CARDS ================= */}
            <Grid container spacing={2} sx={{ mb: 3 }}>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <LocationOnIcon color="primary" />
                                <Box>
                                    <Typography variant="body2">Total Punch</Typography>
                                    {loading
                                        ? <Skeleton width={60} />
                                        : <Typography variant="h6">{punches.length}</Typography>}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <DirectionsCarIcon color="primary" />
                                <Box>
                                    <Typography variant="body2">Total Distance</Typography>
                                    {loading
                                        ? <Skeleton width={80} />
                                        : <Typography variant="h6">{safeDistance(totalDistance)} km</Typography>}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CurrencyRupeeIcon color="success" />
                                <Box>
                                    <Typography variant="body2">Collection</Typography>
                                    {loading
                                        ? <Skeleton width={80} />
                                        : <Typography variant="h6">₹ {safeAmount(totalCollection)}</Typography>}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <CurrencyRupeeIcon color="error" />
                                <Box>
                                    <Typography variant="body2">Disbursement</Typography>
                                    {loading
                                        ? <Skeleton width={80} />
                                        : <Typography variant="h6">₹ {safeAmount(totalDisbursement)}</Typography>}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            {/* ================= TABLE ================= */}
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">

                    <Table stickyHeader size="small"><TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Visit Type</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Current Address</TableCell>
                            <TableCell>Customer Address</TableCell>
                            <TableCell>Distance</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Remarks</TableCell>
                        </TableRow>
                    </TableHead>

                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={10}>
                                            <Skeleton height={30} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : punches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        No records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                punches.map((p) => (
                                    <TableRow key={p.id} hover>

                                        <TableCell>
                                            {p.punched_at
                                                ? new Date(p.punched_at).toLocaleDateString()
                                                : '--'}
                                        </TableCell>

                                        <TableCell>
                                            {p.punched_at
                                                ? new Date(p.punched_at).toLocaleTimeString()
                                                : '--'}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={p.visit_type || 'VISIT'}
                                                color={
                                                    p.visit_type === 'COLLECTION'
                                                        ? 'success'
                                                        : 'primary'
                                                }
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {p.latitude
                                                ? `${Number(p.latitude).toFixed(5)}, ${Number(p.longitude).toFixed(5)}`
                                                : 'No location'}
                                        </TableCell>

                                        {/* ✅ SAFE RENDER */}
                                        <TableCell sx={{ maxWidth: 250 }}>
                                            {p.current_address?.trim() || '--'}
                                        </TableCell>

                                        <TableCell sx={{ maxWidth: 250 }}>
                                            {p.customer_address?.trim() || '--'}
                                        </TableCell>

                                        <TableCell>
                                            {safeDistance(p.distance_from_last)} km
                                        </TableCell>

                                        <TableCell>
                                            {safeDistance(p.total_distance_day)} km
                                        </TableCell>

                                        <TableCell>
                                            ₹ {safeAmount(p.amount)}
                                        </TableCell>

                                        <TableCell>
                                            {p.notes || '--'}
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>

                    </Table>
                </Table>
            </TableContainer>

        </Box>
    );

};

export default PunchHistory;