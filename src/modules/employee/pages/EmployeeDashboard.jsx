import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
    Grid, Card, CardContent, Typography, Alert, Box,
    Divider, Table, TableHead, TableRow, TableCell,
    TableBody, Chip, Skeleton, LinearProgress
} from '@mui/material';

import api from 'core/services/api';
import MapView from 'modules/attendance/components/MapView';
import DistanceChart from 'modules/attendance/components/DistanceChart';
import AllowanceTrendChart from 'modules/employee/components/AllowanceTrendChart';

import { useAuth } from 'modules/auth/contexts/AuthContext';
import PunchButton from 'modules/attendance/components/PunchButton';

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
    const safeDistance = (v) => (v ? Number(v).toFixed(2) : "0.00");

    // ================= FETCH =================
    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const [summary, punchData, allowanceData] = await Promise.all([
                api.getDailySummary(),
                api.getTodayPunches(),
                api.getAllowanceRequests()
            ]);

            setData(summary?.data || {});

            const sortedPunches = (punchData?.data?.results || punchData?.data || [])
                .filter(p => p.latitude && p.longitude)
                .sort((a, b) => new Date(b.punched_at) - new Date(a.punched_at));

            setPunches(sortedPunches);

            // ✅ DISBURSEMENT CALCULATION (FIXED)
            const totalDisbursement = sortedPunches.reduce(
                (sum, p) =>
                    p.visit_type === 'DISBURSEMENT'
                        ? sum + safe(p.amount)
                        : sum,
                0
            );

            setDisbursement(totalDisbursement);

            let allowanceList = allowanceData?.data?.results || allowanceData?.data || [];

            if (!allowanceList.length) {
                allowanceList = [
                    { travel_date: "2026-04-01", total_amount: 500, total_distance: 5 },
                    { travel_date: "2026-04-02", total_amount: 1200, total_distance: 10 },
                    { travel_date: "2026-04-03", total_amount: 800, total_distance: 7 },
                ];
            }

            setAllowances(allowanceList);

            setError(null);

        } catch (err) {
            console.error("Dashboard Error:", err?.response?.data);
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

    // ================= PRODUCTIVITY =================
    // const productivity = useMemo(() => {
    //     const score = (kpi.punchCount * 10 + Number(kpi.distance)) / 2;
    //     return Math.min(100, score);
    // }, [kpi]);

    // ================= LABEL =================
    const formatPunchLabel = (p, index) => {
        if (index === 0) return 'Latest Punch';
        if (index === punches.length - 1) return 'Starting Punch';
        return 'Activity';
    };

    // ================= CHART DATA =================
    const chartData = useMemo(() => {
        return data?.weekly_data?.length
            ? data.weekly_data
            : [
                { day: 'Mon', distance: 5 },
                { day: 'Tue', distance: 8 },
                { day: 'Wed', distance: 6 },
                { day: 'Thu', distance: 10 },
                { day: 'Fri', distance: 7 }
            ];
    }, [data]);

    const allowanceChartData = useMemo(() => {
        return allowances.map(a => ({
            day: new Date(a.travel_date).toLocaleDateString(),
            amount: safe(a.total_amount),
            distance: safe(a.total_distance)
        }));
    }, [allowances]);

    // ================= LATEST =================
    const latestPunches = useMemo(() => punches.slice(0, 8), [punches]);

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
                    { label: 'Disbursement', value: `₹ ${kpi.disbursement}` }, // ✅ ADDED
                ].map((item, i) => (
                    <Grid item xs={6} md={2.4} key={i}>
                        <Card>
                            <CardContent>
                                <Typography>{item.label}</Typography>
                                {loading
                                    ? <Skeleton width={80} />
                                    : (
                                        <Typography
                                            variant="h6"
                                            color={item.label === 'Disbursement' ? 'error.main' : 'inherit'}
                                        >
                                            {item.value}
                                        </Typography>
                                    )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* PRODUCTIVITY */}
                {/* <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Productivity Score</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={productivity}
                                sx={{ height: 10, borderRadius: 5, mt: 2 }}
                            />
                            <Typography sx={{ mt: 1 }}>
                                {productivity.toFixed(0)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid> */}

                {/* DISTANCE CHART */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Weekly Distance</Typography>
                            {loading
                                ? <Skeleton height={200} />
                                : <DistanceChart data={chartData} />}
                        </CardContent>
                    </Card>
                </Grid>

                {/* MAP */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Live Route Map</Typography>
                            {loading
                                ? <Skeleton height={200} />
                                : <MapView punches={punches} />}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ALLOWANCE CHART */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                Allowance Insights (₹ vs Distance)
                            </Typography>

                            <AllowanceTrendChart data={allowanceChartData} />
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
                                    <TableCell>Visit Type</TableCell>
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
                                                label={formatPunchLabel(p, i)}
                                                color={
                                                    i === 0
                                                        ? 'success'
                                                        : i === punches.length - 1
                                                            ? 'warning'
                                                            : 'primary'
                                                }
                                                size="small"
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