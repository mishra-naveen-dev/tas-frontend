import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, CircularProgress, Grid, Card, CardContent,
    Divider, Stack
} from '@mui/material';

import api from 'core/services/api';

const AdminPunchCorrections = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState(null);

    const [filter, setFilter] = useState('ALL');

    // ================= FETCH =================
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.getCorrections();
            setData(res.data.results || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ================= FILTER =================
    const filteredData = useMemo(() => {
        if (filter === 'ALL') return data;
        return data.filter(d => d.status === filter);
    }, [data, filter]);

    // ================= HELPERS =================
    const getStatusColor = (status) => {
        if (status === 'PENDING') return 'warning';
        if (status === 'APPROVED') return 'success';
        if (status === 'REJECTED') return 'error';
        return 'default';
    };

    // ================= ACTION =================
    const handleAction = async () => {
        try {
            if (actionType === 'APPROVE') {
                await api.post(`/attendance/corrections/${selected.id}/approve/`);
            } else {
                await api.post(`/attendance/corrections/${selected.id}/reject/`, {
                    remarks
                });
            }

            setOpenDialog(false);
            setRemarks('');
            fetchData();

        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" mb={3}>
                Punch Correction Approval Panel
            </Typography>

            {/* ================= FILTER ================= */}
            <Stack direction="row" spacing={2} mb={2}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <Button
                        key={f}
                        variant={filter === f ? 'contained' : 'outlined'}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </Button>
                ))}
            </Stack>

            {/* ================= TABLE ================= */}
            <TableContainer component={Paper}>
                <Table size="small">

                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Requested Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Review</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredData.map((row, i) => (

                            <TableRow key={row.id} hover>

                                <TableCell>{i + 1}</TableCell>

                                <TableCell>
                                    {row.employee_details?.first_name} {row.employee_details?.last_name}
                                </TableCell>

                                <TableCell>{row.correction_type}</TableCell>

                                <TableCell>{row.requested_date}</TableCell>

                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        color={getStatusColor(row.status)}
                                        size="small"
                                    />
                                </TableCell>

                                <TableCell>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            setSelected(row);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        Review
                                    </Button>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>

            {/* ================= REVIEW DIALOG ================= */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>

                <DialogTitle>Review Punch Correction</DialogTitle>

                <DialogContent>

                    {selected && (

                        <Grid container spacing={2}>

                            {/* OLD DATA */}
                            <Grid item xs={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2">Existing Punch</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Typography>Date: {selected.existing_punch_details?.punch_date || '-'}</Typography>
                                        <Typography>Time: {selected.existing_punch_details?.punched_at || '-'}</Typography>
                                        <Typography>Type: {selected.existing_punch_details?.punch_type || '-'}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* NEW DATA */}
                            <Grid item xs={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2">Requested Change</Typography>
                                        <Divider sx={{ my: 1 }} />

                                        <Typography>Date: {selected.requested_date}</Typography>
                                        <Typography>Time: {selected.requested_time}</Typography>
                                        <Typography>Type: {selected.requested_punch_type}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* REASON */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle2">Employee Reason</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography>{selected.reason}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ADMIN REMARK */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Admin Remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </Grid>

                        </Grid>
                    )}

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setOpenDialog(false)}>
                        Close
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        disabled={selected?.status !== 'PENDING'}
                        onClick={() => {
                            setActionType('APPROVE');
                            handleAction();
                        }}
                    >
                        Approve
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        disabled={selected?.status !== 'PENDING'}
                        onClick={() => {
                            setActionType('REJECT');
                            handleAction();
                        }}
                    >
                        Reject
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
};

export default AdminPunchCorrections;