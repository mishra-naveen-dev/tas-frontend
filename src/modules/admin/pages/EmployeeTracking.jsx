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
import AdvancedFilter from 'shared/components/AdvancedFilter';

const EmployeeTracking = () => {

    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filteredRecords, setFilteredRecords] = useState([]);

    const [routeModal, setRouteModal] = useState({
        open: false,
        employee: null,
        route: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        from: '',
        to: '',
        type: 'ALL'
    });

    // ================= SAFE LIST =================
    const getList = (res) => res?.data?.results || res?.data || [];

    // ================= FETCH =================
    const loadData = useCallback(async () => {
        try {
            const [usersRes, punchesRes] = await Promise.all([
                api.getUsers(),
                api.getPunchRecords()
            ]);

            const users = getList(usersRes);
            const punches = getList(punchesRes);

            const map = {};

            users.forEach(u => {
                const key = String(u.employee_id || u.id);

                map[key] = {
                    employee_id: key,
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
                    todayPunches: 0,
                    distance: 0,
                    collection: 0,
                    disbursement: 0,
                    lastPunch: null,
                    records: []
                };
            });

            punches.forEach(p => {
                const key = String(
                    p.employee_details?.employee_id ||
                    p.employee_id ||
                    p.employee
                );

                if (!map[key]) return;

                const emp = map[key];

                emp.todayPunches += 1;
                emp.distance += Number(p.distance_from_last || 0);

                if (p.visit_type === 'COLLECTION')
                    emp.collection += Number(p.amount || 0);

                if (p.visit_type === 'DISBURSEMENT')
                    emp.disbursement += Number(p.amount || 0);

                if (!emp.lastPunch || new Date(p.punched_at) > new Date(emp.lastPunch)) {
                    emp.lastPunch = p.punched_at;
                }

                emp.records.push(p);
            });

            setEmployees(Object.values(map));
            setError(null);

        } catch (err) {
            setError('Failed to load tracking data');
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ REALTIME
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [loadData]);

    // ================= SUMMARY =================
    const summary = useMemo(() => {
        const active = employees.filter(e => e.todayPunches > 0).length;

        return {
            total: employees.length,
            active,
            inactive: employees.length - active
        };
    }, [employees]);

    // ================= VIEW DETAILS =================
    const handleView = (emp) => {
        setSelected(emp);
        setFilteredRecords(emp.records);
    };

    // ================= FILTER =================
    const applyFilters = () => {
        if (!selected) return;

        let records = [...selected.records];

        if (filters.from) {
            records = records.filter(r =>
                new Date(r.punched_at) >= new Date(filters.from)
            );
        }

        if (filters.to) {
            const toDate = new Date(filters.to);
            toDate.setHours(23, 59, 59, 999);

            records = records.filter(r =>
                new Date(r.punched_at) <= toDate
            );
        }

        if (filters.type !== 'ALL') {
            records = records.filter(r => r.visit_type === filters.type);
        }

        setFilteredRecords(records);
    };

    // ================= ROUTE =================
    const handleRoute = async (emp) => {
        try {
            const res = await api.getEmployeeRoute(emp.employee_id);

            const route = res?.data || [];

            if (!route.length) {
                alert("No route data available");
                return;
            }

            setRouteModal({
                open: true,
                employee: emp,
                route // ✅ full data (no filtering here)
            });

        } catch (err) {
            console.error(err);
        }
    };

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
                        <Typography>Total</Typography>
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

            {loading ? (
                <CircularProgress />
            ) : (
                <Grid container spacing={2}>
                    {employees.map(emp => (
                        <Grid item xs={12} md={4} key={emp.employee_id}>
                            <EmployeeCard
                                employee={emp}
                                onView={handleView}
                                onRoute={handleRoute}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* ================= DETAILS MODAL ================= */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
                <DialogTitle>{selected?.name} - Activity</DialogTitle>

                <DialogContent>

                    <Stack direction="row" spacing={2} mb={2}>
                        <TextField type="date"
                            onChange={(e) => setFilters(p => ({ ...p, from: e.target.value }))} />
                        <TextField type="date"
                            onChange={(e) => setFilters(p => ({ ...p, to: e.target.value }))} />
                        <TextField select defaultValue="ALL"
                            onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))}>
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="COLLECTION">Collection</MenuItem>
                            <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                        </TextField>
                        <Button onClick={applyFilters}>Apply</Button>
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
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No records
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((r, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {r.punched_at
                                                ? new Date(r.punched_at).toLocaleString()
                                                : '--'}
                                        </TableCell>
                                        <TableCell>{r.visit_type}</TableCell>
                                        <TableCell>{r.distance_from_last || 0}</TableCell>
                                        <TableCell>₹ {r.amount || 0}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                </DialogContent>
            </Dialog>

            {/* ROUTE */}
            <EmployeeRouteModal
                open={routeModal.open}
                onClose={() => setRouteModal({ open: false })}
                employee={routeModal.employee}
                route={routeModal.route}
            />

        </Box>
    );
};

export default EmployeeTracking;