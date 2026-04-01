import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Alert,
    Box,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    Skeleton
} from '@mui/material';

import api from '../../services/api';
import DistanceChart from '../../components/DistanceChart';
import MapView from '../../components/MapView';
import { useAuth } from '../../contexts/AuthContext';
import PunchButton from '../../components/Punch/PunchButton';

const EmployeeDashboard = () => {

    const { user } = useAuth();

    const [data, setData] = useState({});
    const [punches, setPunches] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const intervalRef = useRef(null);
    const isFetching = useRef(false);

    // ================= HELPERS =================
    const safe = (v) => Number(v) || 0;

    const safeDistance = (v) => {
        if (v === null || v === undefined) return "0.00";
        return Number(v).toFixed(2);
    };

    const val = (v) => v || '-';

    // ================= KPI =================
    const kpi = useMemo(() => ({
        punchCount: safe(data?.punch_count),
        distance: safeDistance(data?.total_distance_today),
        duration: val(data?.duration),
        collection: safeDistance(data?.total_collection),
        disbursement: safeDistance(data?.total_disbursement),
    }), [data]);

    // ================= FETCH =================
    const fetchData = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            const [summary, punchData, allowance] = await Promise.all([
                api.getDailySummary(),
                api.getTodayPunches(),
                api.getAllowanceRequests({ status: 'PENDING' })
            ]);

            setData(summary?.data || {});

            // 🔥 ALWAYS SORT HERE
            const sortedPunches = (punchData?.data?.results || punchData?.data || [])
                .sort((a, b) => new Date(b.punched_at) - new Date(a.punched_at));

            setPunches(sortedPunches);

            setPending(allowance?.data?.results || allowance?.data || []);

        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    // ================= LATEST PUNCHES =================
    const latestPunches = useMemo(() => {
        return punches.slice(0, 10);
    }, [punches]);

    // ================= NEW PUNCH =================
    const handleNewPunch = useCallback((newPunch) => {

        setPunches(prev => {
            const updated = [newPunch, ...prev];

            return updated.sort(
                (a, b) => new Date(b.punched_at) - new Date(a.punched_at)
            );
        });

        // 🔥 FORCE REFRESH (SYNC WITH BACKEND)
        fetchData();

    }, [fetchData]);

    // ================= EFFECT =================
    useEffect(() => {
        fetchData();

        const startInterval = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(fetchData, 30000);
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
                startInterval();
            } else {
                clearInterval(intervalRef.current);
            }
        };

        startInterval();
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [fetchData]);

    return (
        <Box sx={{ p: 3 }}>

            {error && <Alert severity="error">{error}</Alert>}

            {/* HEADER */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5">
                    {val(user?.first_name)} {val(user?.last_name)}
                </Typography>
                <Typography color="text.secondary">
                    Employee ID: {val(user?.employee_id)}
                </Typography>
            </Box>

            {/* PUNCH */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">Punch</Typography>
                    <PunchButton onSuccess={handleNewPunch} />
                </CardContent>
            </Card>

            {/* KPI */}
            <Grid container spacing={3}>
                {[
                    { label: 'Punch Count', value: kpi.punchCount },
                    { label: 'Distance', value: `${kpi.distance} km` },
                    { label: 'Working Time', value: kpi.duration },
                    { label: 'Pending', value: pending.length },
                    { label: 'Collection', value: `₹ ${kpi.collection}` },
                    { label: 'Disbursement', value: `₹ ${kpi.disbursement}` }
                ].map((item, i) => (
                    <Grid item xs={6} md={2} key={i}>
                        <Card>
                            <CardContent>
                                <Typography>{item.label}</Typography>
                                {loading
                                    ? <Skeleton width={80} height={30} />
                                    : <Typography variant="h6">{item.value}</Typography>
                                }
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* CHART */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Weekly Distance</Typography>
                            {loading
                                ? <Skeleton variant="rectangular" height={200} />
                                : <DistanceChart data={data?.weekly_data || []} />
                            }
                        </CardContent>
                    </Card>
                </Grid>

                {/* MAP */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Live Map</Typography>
                            {loading
                                ? <Skeleton variant="rectangular" height={200} />
                                : <MapView punches={punches} />
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ACTIVITY TABLE */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Today Activity</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Showing latest 10 punches
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {loading ? (
                        <Skeleton variant="rectangular" height={200} />
                    ) : latestPunches.length === 0 ? (
                        <Alert severity="info">No activity today</Alert>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Distance</TableCell>
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {latestPunches.map((p, i) => (
                                    <TableRow key={p.id || i} hover>

                                        <TableCell>{i + 1}</TableCell>

                                        <TableCell>
                                            <Chip
                                                label={p.punch_type || 'N/A'}
                                                color={p.punch_type === 'PUNCH_IN' ? 'success' : 'primary'}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            {p.punched_at
                                                ? new Date(p.punched_at).toLocaleTimeString()
                                                : '--'}
                                        </TableCell>

                                        <TableCell>
                                            {p.punched_at
                                                ? new Date(p.punched_at).toLocaleDateString()
                                                : '--'}
                                        </TableCell>

                                        <TableCell>
                                            {p.latitude && p.longitude
                                                ? `${Number(p.latitude).toFixed(5)}, ${Number(p.longitude).toFixed(5)}`
                                                : 'No location'}
                                        </TableCell>

                                        <TableCell>
                                            {safeDistance(p.distance_from_last)} km
                                        </TableCell>

                                        <TableCell>
                                            {safeDistance(p.total_distance_day)} km
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