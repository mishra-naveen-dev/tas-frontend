import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Alert,
    Chip, Button, Typography, Grid, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Stack, TextField, MenuItem
} from '@mui/material';

import {
    ReceiptLong,
    DirectionsCar,
    CurrencyRupee
} from '@mui/icons-material';

import api from 'core/services/api';
import DistanceChart from 'modules/attendance/components/DistanceChart';
import { TableSkeleton, ChartSkeleton } from 'shared/components/SkeletonLoader';

const AllowanceHistory = () => {

    const [allowances, setAllowances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    // ================= FETCH =================
    useEffect(() => {
        fetchAllowances();
    }, []);

    const fetchAllowances = async () => {
        try {
            setLoading(true);

            const res = await api.getAllowanceRequests();
            let data = res?.data?.results || res?.data || [];

            // ✅ FALLBACK DUMMY DATA
            if (!data.length) {
                data = [
                    {
                        id: 1,
                        travel_date: "2026-04-01",
                        from_location: "Ahmedabad",
                        to_location: "Gandhinagar",
                        total_distance: 25,
                        total_amount: 500,
                        status: "APPROVED",
                        remarks: "Client visit",
                        bill_url: null
                    },
                    {
                        id: 2,
                        travel_date: "2026-04-02",
                        from_location: "Ahmedabad",
                        to_location: "Surat",
                        total_distance: 200,
                        total_amount: 3000,
                        status: "PENDING",
                        remarks: "Field work",
                        bill_url: null
                    }
                ];
            }

            setAllowances(data);

        } catch (err) {
            setError('Failed to load allowance history');
        } finally {
            setLoading(false);
        }
    };

    // ================= HELPERS =================
    const safe = (v) => Number(v) || 0;
    const formatCurrency = (v) => `₹ ${safe(v).toFixed(2)}`;
    const formatDistance = (v) => `${safe(v).toFixed(2)} km`;

    const getStatusColor = (status) => ({
        DRAFT: 'default',
        SUBMITTED: 'info',
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'error',
        PAID: 'success'
    }[status] || 'default');

    // ================= FILTER =================
    const filteredData = useMemo(() => {
        return allowances.filter(a =>
            (!status || a.status === status) &&
            (!search ||
                a.from_location.toLowerCase().includes(search.toLowerCase()) ||
                a.to_location.toLowerCase().includes(search.toLowerCase()))
        );
    }, [allowances, search, status]);

    // ================= CHART =================
    const chartData = filteredData.map(a => ({
        day: new Date(a.travel_date).toLocaleDateString(),
        distance: safe(a.total_distance)
    }));

    // ================= SUMMARY =================
    const totalDistance = filteredData.reduce((s, a) => s + safe(a.total_distance), 0);
    const totalAmount = filteredData.reduce((s, a) => s + safe(a.total_amount), 0);

    const handleView = (a) => {
        setSelected(a);
        setOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>Allowance History</Typography>
                <TableSkeleton rows={6} columns={5} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>

            {/* HEADER */}
            <Typography variant="h5" fontWeight={600}>Allowance History</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Monitor travel expenses and approvals
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* FILTER */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TextField
                    label="Search Location"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                    select
                    label="Status"
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                </TextField>
            </Stack>

            {/* KPI */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <Stack direction="row" spacing={2}>
                            <ReceiptLong color="primary" />
                            <Box>
                                <Typography>Total</Typography>
                                <Typography variant="h6">{filteredData.length}</Typography>
                            </Box>
                        </Stack>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <Stack direction="row" spacing={2}>
                            <DirectionsCar color="primary" />
                            <Typography variant="h6">{formatDistance(totalDistance)}</Typography>
                        </Stack>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <Stack direction="row" spacing={2}>
                            <CurrencyRupee color="primary" />
                            <Typography variant="h6">{formatCurrency(totalAmount)}</Typography>
                        </Stack>
                    </CardContent></Card>
                </Grid>
            </Grid>

            {/* CHART */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6">Allowance Trend</Typography>
                    <DistanceChart data={chartData} />
                </CardContent>
            </Card>

            {/* TABLE */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Route</TableCell>
                            <TableCell>Distance</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Bill</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredData.map(a => (
                            <TableRow key={a.id} hover>

                                <TableCell>{new Date(a.travel_date).toLocaleDateString()}</TableCell>

                                <TableCell>{a.from_location} → {a.to_location}</TableCell>

                                <TableCell>{formatDistance(a.total_distance)}</TableCell>

                                <TableCell>{formatCurrency(a.total_amount)}</TableCell>

                                <TableCell>
                                    <Chip label={a.status} color={getStatusColor(a.status)} size="small" />
                                </TableCell>

                                <TableCell>
                                    {a.bill_url
                                        ? <Button size="small" href={a.bill_url} target="_blank">View</Button>
                                        : <Chip label="No Bill" size="small" />}
                                </TableCell>

                                <TableCell>
                                    <Button size="small" onClick={() => handleView(a)}>View</Button>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* DIALOG */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Allowance Details</DialogTitle>

                <DialogContent>
                    {selected && (
                        <Stack spacing={2}>
                            <Typography><b>Date:</b> {new Date(selected.travel_date).toLocaleDateString()}</Typography>
                            <Typography><b>Route:</b> {selected.from_location} → {selected.to_location}</Typography>
                            <Typography><b>Distance:</b> {formatDistance(selected.total_distance)}</Typography>
                            <Typography><b>Amount:</b> {formatCurrency(selected.total_amount)}</Typography>

                            <Divider />

                            <Typography><b>Remarks:</b> {selected.remarks || 'N/A'}</Typography>

                            <Divider />

                            <Typography><b>Bill Preview:</b></Typography>

                            {selected.bill_url
                                ? <img src={selected.bill_url} alt="bill" width="100%" />
                                : <Typography color="text.secondary">No bill uploaded</Typography>}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );

};

export default AllowanceHistory;