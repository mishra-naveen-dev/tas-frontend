import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense } from 'react';
import {
    Grid, Card, CardContent, Typography, Alert, Box,
    Divider, Table, TableHead, TableRow, TableCell,
    TableBody, Chip, Skeleton
} from '@mui/material';

import api from 'core/services/api';
import DistanceChart from 'modules/attendance/components/DistanceChart';
import AllowanceTrendChart from 'modules/employee/components/AllowanceTrendChart';
import { useAuth } from 'modules/auth/contexts/AuthContext';
import PunchButton from 'modules/attendance/components/PunchButton';

const MapView = React.lazy(() => import('modules/attendance/components/MapView'));

const REFRESH_INTERVAL = 30000;

const EmployeeDashboard = () => {

    const { user } = useAuth();

    const [data, setData] = useState({});
    const [punches, setPunches] = useState([]);
    const [allowances, setAllowances] = useState([]);
    const [disbursement, setDisbursement] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const intervalRef = useRef(null);
    const isFetching = useRef(false);

    // ================= HELPERS =================
    const safe = (v) => Number(v) || 0;
    const safeDistance = (v) => Number(v || 0).toFixed(2);

    // ================= FETCH =================
    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            setError(null);

            const [summaryRes, punchRes, allowanceRes] = await Promise.all([
                api.getDailySummary().catch(() => ({ data: {} })),
                api.getTodayPunches().catch(() => ({ data: [] })),
                api.getAllowanceRequests().catch(() => ({ data: [] }))
            ]);

            const summary = summaryRes?.data || {};
            const punchList = punchRes?.data?.results || punchRes?.data || [];
            const allowanceList = allowanceRes?.data?.results || allowanceRes?.data || [];

            // ================= SET SUMMARY =================
            setData(summary);

            // ================= SORT PUNCHES =================
            const sortedPunches = punchList
                .filter(p => p?.latitude && p?.longitude)
                .sort((a, b) => new Date(b.punched_at) - new Date(a.punched_at));

            setPunches(sortedPunches);

            // ================= DISBURSEMENT =================
            const totalDisbursement = sortedPunches.reduce(
                (sum, p) =>
                    p.visit_type === 'DISBURSEMENT'
                        ? sum + safe(p.amount)
                        : sum,
                0
            );

            setDisbursement(totalDisbursement);

            // ================= ALLOWANCE =================
            setAllowances(allowanceList.length ? allowanceList : []);

        } catch (err) {

            console.error("Dashboard Error:", {
                message: err?.message,
                response: err?.response?.data
            });

            setError('Failed to load dashboard');

        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    // ================= AUTO REFRESH =================
    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [fetchData]);

    // ================= KPI =================
    const kpi = useMemo(() => ({
        punchCount: safe(data?.punch_count),
        distance: safeDistance(data?.total_distance_today),
        duration: data?.duration || '--',
        collection: safeDistance(data?.total_collection),
        disbursement: safeDistance(disbursement),
    }), [data, disbursement]);

    // ================= CHART DATA =================
    const chartData = useMemo(() => {
        return data?.weekly_data?.length
            ? data.weekly_data
            : [];
    }, [data]);

    const allowanceChartData = useMemo(() => {
        return allowances.map(a => ({
            day: new Date(a.travel_date).toLocaleDateString(),
            amount: safe(a.total_amount),
            distance: safe(a.total_distance)
        }));
    }, [allowances]);

    const latestPunches = useMemo(() => punches.slice(0, 8), [punches]);

    // ================= LABEL =================
    const formatPunchLabel = (index) => {
        if (index === 0) return 'Latest';
        if (index === punches.length - 1) return 'Start';
        return 'Visit';
    };

    return (
        <Box sx={{ p: 3 }}>

            {error && <Alert severity="error">{error}</Alert>}

            {/* HEADER */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5">
                    {user?.first_name} {user?.last_name}
                </Typography>
                <Typography color="text.secondary">
                    Employee ID: {user?.employee_id}
                </Typography>
            </Box>

            {/* PUNCH */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">Punch Action</Typography>
                    <PunchButton />
                </CardContent>
            </Card>

            {/* KPI */}
            <Grid container spacing={3}>
                {[
                    { label: 'Punch Count', value: kpi.punchCount },
                    { label: 'Distance', value: `${kpi.distance} km` },
                    { label: 'Working Time', value: kpi.duration },
                    { label: 'Collection', value: `₹ ${kpi.collection}` },
                    { label: 'Disbursement', value: `₹ ${kpi.disbursement}` }
                ].map((item, i) => (
                    <Grid item xs={6} md={2.4} key={i}>
                        <Card>
                            <CardContent>
                                <Typography>{item.label}</Typography>
                                {loading
                                    ? <Skeleton width={80} />
                                    : <Typography variant="h6">{item.value}</Typography>}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* DISTANCE CHART */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Weekly Distance</Typography>
                            <Box sx={{ width: '100%', height: 250 }}>
                                {loading
                                    ? <Skeleton height={200} />
                                    : <DistanceChart data={chartData} />}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* MAP */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Live Route Map</Typography>
                            <Box sx={{ width: '100%', height: 250 }}>
                                <Suspense fallback={<Skeleton height={200} />}>
                                    <MapView punches={punches} />
                                </Suspense>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ALLOWANCE */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Allowance Insights</Typography>
                            <Box sx={{ width: '100%', height: 250 }}>
                                <AllowanceTrendChart data={allowanceChartData} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ACTIVITY */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Today Activity</Typography>
                    <Divider sx={{ my: 2 }} />

                    {loading ? (
                        <Skeleton height={200} />
                    ) : latestPunches.length === 0 ? (
                        <Alert severity="info">No activity yet</Alert>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Distance</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {latestPunches.map((p, i) => (
                                    <TableRow key={p.id || i}>
                                        <TableCell>{i + 1}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={formatPunchLabel(i)}
                                                size="small"
                                                color={i === 0 ? 'success' : 'primary'}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {new Date(p.punched_at).toLocaleTimeString()}
                                        </TableCell>

                                        <TableCell>
                                            {p.latitude
                                                ? `${Number(p.latitude).toFixed(4)}, ${Number(p.longitude).toFixed(4)}`
                                                : 'No location'}
                                        </TableCell>

                                        <TableCell>
                                            {safeDistance(p.distance_from_last)} km
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

        </Box>
    );
};

export default React.memo(EmployeeDashboard);