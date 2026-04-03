import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Grid, Typography, Dialog, DialogTitle, DialogContent,
    Table, TableHead, TableRow, TableCell, TableBody,
    Button, CircularProgress, Alert, TextField, MenuItem,
    Stack, Card, CardContent
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import api from 'core/services/api';
import EmployeeCard from 'modules/admin/components/EmployeeCard';
import EmployeeRouteModal from 'modules/employee/components/EmployeeRouteModal';

const EmployeeTracking = () => {

    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);

    const [selected, setSelected] = useState(null);
    const [filteredRecords, setFilteredRecords] = useState([]);

    const [routeModal, setRouteModal] = useState({
        open: false,
        employee: null
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [detailFilters, setDetailFilters] = useState({
        from: '',
        to: '',
        type: 'ALL'
    });

    // ================= FETCH =================
    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const [usersRes, punchesRes] = await Promise.all([
                api.getUsers(),
                api.getPunchRecords()
            ]);

            const usersData = usersRes?.data || {};
            const users = usersData.results || usersData || [];
            const punches = punchesRes?.data?.results || punchesRes?.data || [];

            setTotalEmployees(usersData.count || users.length);

            const map = {};

            // USERS
            users.forEach(u => {
                const key = String(u.employee_id || u.id);

                map[key] = {
                    id: key,
                    name: `${u.first_name || ''} ${u.last_name || ''}`,
                    todayPunches: 0,
                    distance: 0,
                    collection: 0,
                    disbursement: 0,
                    lastPunch: null,
                    records: []
                };
            });

            // PUNCHES
            punches.forEach(p => {

                const key = String(
                    p.employee_details?.employee_id ||
                    p.employee_id ||
                    p.employee
                );

                if (!map[key]) {
                    map[key] = {
                        id: key,
                        name: p.employee_details?.name || `Emp ${key}`,
                        todayPunches: 0,
                        distance: 0,
                        collection: 0,
                        disbursement: 0,
                        lastPunch: null,
                        records: []
                    };
                }

                const emp = map[key];

                const distance = Number(p.distance_from_last) || 0;
                const amount = Number(p.amount) || 0;

                emp.todayPunches += 1;
                emp.distance += distance;

                if (p.visit_type === 'COLLECTION') emp.collection += amount;
                if (p.visit_type === 'DISBURSEMENT') emp.disbursement += amount;

                if (!emp.lastPunch || new Date(p.punched_at) > new Date(emp.lastPunch)) {
                    emp.lastPunch = p.punched_at;
                }

                emp.records.push(p);
            });

            setEmployees(Object.values(map));

        } catch (err) {
            setError('Failed to load tracking data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ================= SUMMARY =================
    const activeCount = employees.filter(e => e.todayPunches > 0).length;

    const summary = useMemo(() => ({
        total: Math.max(totalEmployees, employees.length),
        active: activeCount,
        inactive: Math.max(totalEmployees, employees.length) - activeCount
    }), [employees, totalEmployees, activeCount]);

    // ================= FILTER =================
    const applyDetailFilter = () => {
        if (!selected) return;

        let records = [...selected.records];

        if (detailFilters.from) {
            records = records.filter(r => new Date(r.punched_at) >= new Date(detailFilters.from));
        }

        if (detailFilters.to) {
            records = records.filter(r => new Date(r.punched_at) <= new Date(detailFilters.to));
        }

        if (detailFilters.type !== 'ALL') {
            records = records.filter(r => r.visit_type === detailFilters.type);
        }

        setFilteredRecords(records);
    };

    useEffect(() => {
        if (selected) setFilteredRecords(selected.records);
    }, [selected]);

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" mb={3}>
                Employee Tracking Panel
            </Typography>

            {/* SUMMARY */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <PeopleIcon />
                        <Typography>Total Employees</Typography>
                        <Typography variant="h6">{summary.total}</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <CheckCircleIcon color="success" />
                        <Typography>Active</Typography>
                        <Typography variant="h6">{summary.active}</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card><CardContent>
                        <CancelIcon color="error" />
                        <Typography>Inactive</Typography>
                        <Typography variant="h6">{summary.inactive}</Typography>
                    </CardContent></Card>
                </Grid>
            </Grid>

            {error && <Alert severity="error">{error}</Alert>}

            {/* CARDS */}
            {loading ? (
                <CircularProgress />
            ) : (
                <Grid container spacing={2}>
                    {employees.map(emp => (
                        <Grid item xs={12} md={4} key={emp.id}>
                            <EmployeeCard
                                employee={emp}
                                onView={setSelected}
                                onRoute={(emp) =>
                                    setRouteModal({ open: true, employee: emp })
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* DETAILS MODAL */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
                <DialogTitle>{selected?.name}</DialogTitle>

                <DialogContent>

                    <Stack direction="row" spacing={2} mb={2}>
                        <TextField type="date" size="small"
                            onChange={(e) => setDetailFilters(p => ({ ...p, from: e.target.value }))} />
                        <TextField type="date" size="small"
                            onChange={(e) => setDetailFilters(p => ({ ...p, to: e.target.value }))} />
                        <TextField select size="small"
                            onChange={(e) => setDetailFilters(p => ({ ...p, type: e.target.value }))}>
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="COLLECTION">Collection</MenuItem>
                            <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                        </TextField>
                        <Button onClick={applyDetailFilter}>Apply</Button>
                    </Stack>

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Amount</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredRecords.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell>{new Date(r.punched_at).toLocaleString()}</TableCell>
                                    <TableCell>{r.visit_type}</TableCell>
                                    <TableCell>{r.distance_from_last}</TableCell>
                                    <TableCell>₹ {r.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </DialogContent>
            </Dialog>

            {/* ROUTE MODAL */}
            <EmployeeRouteModal
                open={routeModal.open}
                onClose={() => setRouteModal({ open: false, employee: null })}
                employee={routeModal.employee}
                allPunches={employees.flatMap(e => e.records)}
            />

        </Box>
    );

};

export default EmployeeTracking;