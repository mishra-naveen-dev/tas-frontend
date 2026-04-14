import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense } from 'react';
import { Grid, Card, CardContent, Typography, Alert, Box, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip, Skeleton, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { 
    DirectionsWalk as WalkIcon, 
    LocationOn as LocationIcon,
    Timeline as RouteIcon,
    MyLocation as StartIcon,
    Flag as EndIcon,
    Refresh as RefreshIcon,
    PlayArrow as TrackIcon
} from '@mui/icons-material';
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
    const [routeData, setRouteData] = useState(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const intervalRef = useRef(null);
    const isFetching = useRef(false);

    const safe = (v) => Number(v) || 0;
    const safeDistance = (v) => Number(v || 0).toFixed(2);

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

            setData(summary);
            const sortedPunches = punchList.filter(p => p?.latitude && p?.longitude).sort((a, b) => new Date(b.punched_at) - new Date(a.punched_at));
            setPunches(sortedPunches);
            setDisbursement(sortedPunches.reduce((sum, p) => p.visit_type === 'DISBURSEMENT' ? sum + safe(p.amount) : sum, 0));
            setAllowances(allowanceList.length ? allowanceList : []);
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [fetchData]);

    const kpi = useMemo(() => ({
        punchCount: safe(data?.punch_count),
        distance: safeDistance(data?.total_distance_today),
        duration: data?.duration || '--',
        collection: safeDistance(data?.total_collection),
        disbursement: safeDistance(disbursement),
    }), [data, disbursement]);

    const fetchRouteData = useCallback(async () => {
        setRouteLoading(true);
        try {
            const date = new Date().toISOString().split('T')[0];
            const response = await api.getDailyRoute(user?.id, { date });
            setRouteData(response.data);
        } catch (err) {
            console.error('Route fetch error:', err);
            setRouteData(null);
        } finally {
            setRouteLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRouteData();
    }, [fetchRouteData]);

    const chartData = useMemo(() => data?.weekly_data?.length ? data.weekly_data : [], [data]);
    const allowanceChartData = useMemo(() => allowances.map(a => ({ day: new Date(a.travel_date).toLocaleDateString(), amount: safe(a.total_amount), distance: safe(a.total_distance) })), [allowances]);
    const latestPunches = useMemo(() => punches.slice(0, 8), [punches]);

    return (
        <Box sx={{ p: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ mb: 3 }}>
                <Typography variant="h5">{user?.first_name} {user?.last_name}</Typography>
                <Typography color="text.secondary">Employee ID: {user?.employee_id}</Typography>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">Punch Action</Typography>
                    <PunchButton />
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {[{ label: 'Punch Count', value: kpi.punchCount }, { label: 'Distance', value: `${kpi.distance} km` }, { label: 'Working Time', value: kpi.duration }, { label: 'Collection', value: `₹ ${kpi.collection}` }, { label: 'Disbursement', value: `₹ ${kpi.disbursement}` }].map((item, i) => (
                    <Grid item xs={6} md={2.4} key={i}>
                        <Card><CardContent>
                            <Typography>{item.label}</Typography>
                            {loading ? <Skeleton width={80} /> : <Typography variant="h6">{item.value}</Typography>}
                        </CardContent></Card>
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <RouteIcon sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h6">Today's Route Tracking</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            {routeData?.total_sessions || 0} visits • {routeData?.total_points || 0} location points
                                        </Typography>
                                    </Box>
                                </Box>
                                <Tooltip title="Refresh Route">
                                    <IconButton onClick={fetchRouteData} sx={{ color: 'white' }}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {routeLoading ? (
                                <LinearProgress sx={{ mt: 2 }} />
                            ) : routeData?.route?.length > 0 ? (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Chip 
                                            icon={<StartIcon />} 
                                            label={routeData.route[0]?.lat ? 'Start Point' : 'No Start'} 
                                            size="small" 
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                        />
                                        <Box sx={{ flex: 1, height: 2, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                                        <Chip 
                                            icon={<EndIcon />} 
                                            label={routeData.route[routeData.route.length - 1]?.lat ? `End (${routeData.route.length - 1} stops)` : 'No End'} 
                                            size="small"
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                        />
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                                                <WalkIcon />
                                                <Typography variant="h5">{routeData?.total_distance?.toFixed(2) || '0.00'}</Typography>
                                                <Typography variant="caption">Total Distance (km)</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                                                <LocationIcon />
                                                <Typography variant="h5">{routeData?.total_sessions || 0}</Typography>
                                                <Typography variant="caption">Total Visits</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                                                <TrackIcon />
                                                <Typography variant="h5">{routeData?.total_points || 0}</Typography>
                                                <Typography variant="caption">GPS Points</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    {routeData.sessions?.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Session Details:</Typography>
                                            {routeData.sessions.slice(0, 3).map((session, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1, mb: 0.5 }}>
                                                    <Typography variant="body2">Session {idx + 1}</Typography>
                                                    <Typography variant="body2">{session.total_distance?.toFixed(2) || '0'} km • {session.point_count || 0} points</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ mt: 2, textAlign: 'center', py: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                                    <Typography variant="body2">No route data for today</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Punch in to start tracking your route</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card><CardContent>
                        <Typography variant="h6">Weekly Distance</Typography>
                        <Box sx={{ width: '100%', height: 250 }}>
                            {loading ? <Skeleton height={200} /> : <DistanceChart data={chartData} />}
                        </Box>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card><CardContent>
                        <Typography variant="h6">Live Route Map</Typography>
                        <Box sx={{ width: '100%', height: 250 }}>
                            <Suspense fallback={<Skeleton height={200} />}>
                                <MapView punches={punches} />
                            </Suspense>
                        </Box>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={12}>
                    <Card><CardContent>
                        <Typography variant="h6">Allowance Insights</Typography>
                        <Box sx={{ width: '100%', height: 250 }}><AllowanceTrendChart data={allowanceChartData} /></Box>
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Today Activity</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Table size="small">
                        <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}><TableCell><strong>#</strong></TableCell><TableCell><strong>Type</strong></TableCell><TableCell><strong>Time</strong></TableCell><TableCell><strong>Location</strong></TableCell><TableCell><strong>Distance</strong></TableCell></TableRow></TableHead>
                        <TableBody>
                            {latestPunches.map((p, i) => (
                                <TableRow key={p.id || i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell><Chip label={p.visit_type || p.punch_type} size="small" /></TableCell>
                                    <TableCell>{new Date(p.punched_at).toLocaleTimeString()}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{p.current_address || '--'}</Typography></TableCell>
                                    <TableCell>{safeDistance(p.distance_from_last)} km</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EmployeeDashboard;
