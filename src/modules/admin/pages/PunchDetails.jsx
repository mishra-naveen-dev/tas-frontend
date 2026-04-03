import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography,
    Table, TableHead, TableRow, TableCell,
    TableBody, Grid, Chip, Skeleton, Divider, Avatar,
    TextField, MenuItem, Stack, Button
} from '@mui/material';

import MapIcon from '@mui/icons-material/Map';

import api from 'core/services/api';
import EmployeeRouteModal from 'modules/employee/components/EmployeeRouteModal';

const PunchDetails = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        from: '',
        to: '',
        employee: 'ALL',
        type: 'ALL'
    });

    // ✅ ROUTE MODAL STATE
    const [routeModal, setRouteModal] = useState({
        open: false,
        employee: null
    });

    // ================= FETCH =================
    const fetchPunches = async () => {
        setLoading(true);
        try {
            const res = await api.getPunchRecords();
            setData(res?.data?.results || res?.data || []);
        } catch (err) {
            console.error("Error fetching punches:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPunches();
    }, []);

    // ================= HELPERS =================
    const getEmployee = (p) => ({
        id: p.employee_details?.employee_id || p.employee_id || 'N/A',
        name:
            p.employee_details?.name ||
            p.employee_name ||
            `Emp ${p.employee_id || ''}`
    });

    const getPunchBy = (p) => ({
        id:
            p.created_by_details?.employee_id ||
            p.created_by ||
            p.user_id ||
            'N/A',
        name:
            p.created_by_details?.name ||
            p.created_by_name ||
            `User ${p.created_by || ''}`
    });

    const safe = (v) => (v ? Number(v).toFixed(2) : '0.00');

    // ================= EMPLOYEE LIST =================
    const employeeOptions = useMemo(() => {
        const set = new Map();

        data.forEach(p => {
            const emp = getEmployee(p);
            set.set(emp.id, emp.name);
        });

        return Array.from(set.entries()).map(([id, name]) => ({
            id,
            name
        }));
    }, [data]);

    // ================= APPLY FILTER =================
    const filteredData = useMemo(() => {

        let result = [...data];

        if (filters.from) {
            result = result.filter(p =>
                new Date(p.punched_at) >= new Date(filters.from)
            );
        }

        if (filters.to) {
            result = result.filter(p =>
                new Date(p.punched_at) <= new Date(filters.to)
            );
        }

        if (filters.employee !== 'ALL') {
            result = result.filter(p =>
                getEmployee(p).id === filters.employee
            );
        }

        if (filters.type !== 'ALL') {
            result = result.filter(p =>
                p.visit_type === filters.type || p.punch_type === filters.type
            );
        }

        return result;

    }, [data, filters]);

    // ================= GROUP =================
    const groupedData = useMemo(() => {
        const map = {};

        filteredData.forEach(p => {
            const emp = getEmployee(p);

            if (!map[emp.id]) {
                map[emp.id] = {
                    employee_name: emp.name,
                    employee_id: emp.id,
                    punches: []
                };
            }

            map[emp.id].punches.push(p);
        });

        return Object.values(map);
    }, [filteredData]);

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" sx={{ mb: 3 }}>
                Employee Punch Details
            </Typography>

            {/* ================= FILTER BAR ================= */}
            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">

                <TextField
                    type="date"
                    size="small"
                    label="From"
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) =>
                        setFilters(prev => ({ ...prev, from: e.target.value }))
                    }
                />

                <TextField
                    type="date"
                    size="small"
                    label="To"
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) =>
                        setFilters(prev => ({ ...prev, to: e.target.value }))
                    }
                />

                <TextField
                    select
                    size="small"
                    label="Employee"
                    value={filters.employee}
                    onChange={(e) =>
                        setFilters(prev => ({ ...prev, employee: e.target.value }))
                    }
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="ALL">All Employees</MenuItem>
                    {employeeOptions.map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                            {emp.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    size="small"
                    label="Type"
                    value={filters.type}
                    onChange={(e) =>
                        setFilters(prev => ({ ...prev, type: e.target.value }))
                    }
                >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="PUNCH_IN">Punch</MenuItem>
                    <MenuItem value="COLLECTION">Collection</MenuItem>
                    <MenuItem value="DISBURSEMENT">Disbursement</MenuItem>
                </TextField>

                <Button
                    variant="outlined"
                    onClick={() =>
                        setFilters({
                            from: '',
                            to: '',
                            employee: 'ALL',
                            type: 'ALL'
                        })
                    }
                >
                    Reset
                </Button>

            </Stack>

            {/* ================= DATA ================= */}
            {loading ? (
                <Skeleton variant="rectangular" height={300} />
            ) : groupedData.length === 0 ? (
                <Typography>No data available</Typography>
            ) : (
                <Grid container spacing={3}>

                    {groupedData.map((emp, idx) => {

                        const punches = emp.punches;

                        return (
                            <Grid item xs={12} key={idx}>

                                <Card>
                                    <CardContent>

                                        {/* HEADER */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                    {emp.employee_name?.charAt(0)}
                                                </Avatar>

                                                <Box>
                                                    <Typography variant="h6">
                                                        {emp.employee_name}
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {emp.employee_id}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* ✅ VIEW ROUTE BUTTON */}
                                            <Button
                                                size="small"
                                                startIcon={<MapIcon />}
                                                onClick={() =>
                                                    setRouteModal({
                                                        open: true,
                                                        employee: emp
                                                    })
                                                }
                                            >
                                                View Route
                                            </Button>

                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Employee</TableCell>
                                                    <TableCell>Punched By</TableCell>
                                                    <TableCell>Distance</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {punches.map((p, i) => {

                                                    const empInfo = getEmployee(p);
                                                    const userInfo = getPunchBy(p);

                                                    const isSame = empInfo.id === userInfo.id;

                                                    return (
                                                        <TableRow key={i}>
                                                            <TableCell>{i + 1}</TableCell>

                                                            <TableCell>
                                                                <Chip
                                                                    label={p.visit_type || p.punch_type}
                                                                    size="small"
                                                                />
                                                            </TableCell>

                                                            <TableCell>
                                                                {new Date(p.punched_at).toLocaleString()}
                                                            </TableCell>

                                                            <TableCell>
                                                                {empInfo.name}
                                                            </TableCell>

                                                            <TableCell>
                                                                {isSame ? (
                                                                    <Chip label="Self" color="success" size="small" />
                                                                ) : (
                                                                    userInfo.name
                                                                )}
                                                            </TableCell>

                                                            <TableCell>
                                                                {safe(p.distance_from_last)} km
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>

                                    </CardContent>
                                </Card>

                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* ================= ROUTE MODAL ================= */}
            <EmployeeRouteModal
                open={routeModal.open}
                onClose={() => setRouteModal({ open: false, employee: null })}
                employee={routeModal.employee}
                allPunches={data}
            />

        </Box>
    );

};

export default PunchDetails;