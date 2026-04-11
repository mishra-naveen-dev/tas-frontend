import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    TextField,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import {
    Map as MapIcon,
    DirectionsWalk as WalkIcon,
    Timeline as TimelineIcon,
    Close as CloseIcon,
    CalendarMonth as CalendarIcon,
    Person as PersonIcon,
    Speed as SpeedIcon,
    MyLocation as LocationIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from 'core/services/api';

const RouteMap = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [routeDetail, setRouteDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [dailyRoutes, setDailyRoutes] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);

    const fetchRouteHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getRouteHistory({
                date_from: selectedDate,
                date_to: selectedDate
            });
            setSessions(res.data.sessions || []);
            
            const uniqueEmployees = [];
            const empMap = {};
            (res.data.sessions || []).forEach(s => {
                if (!empMap[s.employee_id]) {
                    empMap[s.employee_id] = true;
                    uniqueEmployees.push({
                        id: s.employee_id,
                        name: s.employee_name,
                        code: s.employee_code
                    });
                }
            });
            setEmployees(uniqueEmployees);
        } catch (err) {
            console.error('Failed to fetch route history:', err);
            setError('Failed to load route history');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchRouteHistory();
    }, [fetchRouteHistory]);

    const fetchRouteDetail = async (sessionId) => {
        setDetailLoading(true);
        try {
            const res = await api.getRouteDetail(sessionId);
            setRouteDetail(res.data);
            setSelectedSession(sessionId);
        } catch (err) {
            console.error('Failed to fetch route detail:', err);
            alert('Failed to load route details');
        } finally {
            setDetailLoading(false);
        }
    };

    const fetchDailyRoute = async (employeeId) => {
        try {
            const res = await api.getDailyRoute(employeeId, { date: selectedDate });
            setDailyRoutes(prev => ({
                ...prev,
                [employeeId]: res.data
            }));
            setSelectedEmployee(employeeId);
        } catch (err) {
            console.error('Failed to fetch daily route:', err);
        }
    };

    const getPolylinePositions = (routeData) => {
        if (!routeData || !routeData.route) return [];
        return routeData.route.map(point => [point.lat, point.lng]);
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (start, end) => {
        if (!start || !end) return 'In Progress';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diff = Math.floor((endTime - startTime) / 1000 / 60);
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getMapCenter = (routeData) => {
        if (!routeData || !routeData.route || routeData.route.length === 0) {
            return [20.5937, 78.9629];
        }
        const lats = routeData.route.map(p => p.lat);
        const lngs = routeData.route.map(p => p.lng);
        return [
            (Math.min(...lats) + Math.max(...lats)) / 2,
            (Math.min(...lngs) + Math.max(...lngs)) / 2
        ];
    };

    const startIcon = new L.DivIcon({
        className: 'custom-icon',
        html: '<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    const endIcon = new L.DivIcon({
        className: 'custom-icon',
        html: '<div style="background-color: #f44336; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Route Tracking & Distance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        View employee routes and continuous distance tracking
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            type="date"
                            label="Select Date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            startIcon={<TimelineIcon />}
                            onClick={fetchRouteHistory}
                            fullWidth
                        >
                            Load Routes
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Chip
                            icon={<DirectionsWalkIcon />}
                            label={`${sessions.length} Sessions Found`}
                            color="primary"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={selectedSession ? 6 : 12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                                    Route History
                                </Typography>
                                <TableContainer sx={{ maxHeight: 500 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell><strong>Employee</strong></TableCell>
                                                <TableCell><strong>Date</strong></TableCell>
                                                <TableCell><strong>Time</strong></TableCell>
                                                <TableCell><strong>Distance</strong></TableCell>
                                                <TableCell><strong>Status</strong></TableCell>
                                                <TableCell><strong>Action</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sessions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                                                        No routes found for this date
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                sessions.map((session) => (
                                                    <TableRow
                                                        key={session.session_id}
                                                        hover
                                                        selected={selectedSession === session.session_id}
                                                    >
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <PersonIcon fontSize="small" color="action" />
                                                                <Box>
                                                                    <Typography variant="body2">{session.employee_name}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {session.employee_code}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{session.date}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {formatTime(session.start_time)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTime(session.end_time)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {session.total_distance} km
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={session.is_active ? 'Active' : 'Completed'}
                                                                size="small"
                                                                color={session.is_active ? 'success' : 'default'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<MapIcon />}
                                                                onClick={() => fetchRouteDetail(session.session_id)}
                                                            >
                                                                View Map
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {selectedSession && (
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Route Map
                                        </Typography>
                                        <IconButton size="small" onClick={() => setSelectedSession(null)}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>

                                    {detailLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : routeDetail ? (
                                        <>
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>{routeDetail.session.employee_name}</strong> - 
                                                    Distance: <strong>{routeDetail.total_distance.toFixed(2)} km</strong> | 
                                                    Points: <strong>{routeDetail.total_points}</strong>
                                                </Typography>
                                            </Alert>

                                            <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                                                <MapContainer
                                                    center={getMapCenter(routeDetail)}
                                                    zoom={14}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        attribution='&copy; OpenStreetMap'
                                                    />
                                                    <Polyline
                                                        positions={getPolylinePositions(routeDetail)}
                                                        color="#2196F3"
                                                        weight={4}
                                                        opacity={0.8}
                                                    />
                                                    {routeDetail.route && routeDetail.route.length > 0 && (
                                                        <>
                                                            <Marker
                                                                position={[
                                                                    routeDetail.route[0].lat,
                                                                    routeDetail.route[0].lng
                                                                ]}
                                                                icon={startIcon}
                                                            >
                                                                <Popup>Start Point</Popup>
                                                            </Marker>
                                                            <Marker
                                                                position={[
                                                                    routeDetail.route[routeDetail.route.length - 1].lat,
                                                                    routeDetail.route[routeDetail.route.length - 1].lng
                                                                ]}
                                                                icon={endIcon}
                                                            >
                                                                <Popup>End Point</Popup>
                                                            </Marker>
                                                        </>
                                                    )}
                                                </MapContainer>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                Route Statistics
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6} sm={3}>
                                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                                        <LocationIcon color="primary" />
                                                        <Typography variant="caption" display="block">
                                                            Total Points
                                                        </Typography>
                                                        <Typography variant="h6">{routeDetail.total_points}</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                                        <DirectionsWalkIcon color="primary" />
                                                        <Typography variant="caption" display="block">
                                                            Distance
                                                        </Typography>
                                                        <Typography variant="h6">{routeDetail.total_distance.toFixed(2)} km</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                                        <CalendarIcon color="primary" />
                                                        <Typography variant="caption" display="block">
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="h6">
                                                            {formatDuration(
                                                                routeDetail.session.start_time,
                                                                routeDetail.session.end_time
                                                            )}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                                        <SpeedIcon color="primary" />
                                                        <Typography variant="caption" display="block">
                                                            Avg Speed
                                                        </Typography>
                                                        <Typography variant="h6">
                                                            {routeDetail.route && routeDetail.route.length > 0
                                                                ? (routeDetail.route.reduce((sum, p) => sum + (p.speed || 0), 0) / routeDetail.route.filter(p => p.speed).length || 0).toFixed(1)
                                                                : 0} km/h
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </>
                                    ) : null}
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default RouteMap;
