import React, { useEffect, useState } from 'react';
import {
    Grid, Card, CardContent, Typography,
    CircularProgress, Alert, Box, Button,
    Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DistanceTrendChart from '../admin/DistanceTrendChart';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const res = await api.getDashboardStats();
            setStats(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Admin Dashboard</Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* KPI */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {[
                    { label: 'Employees', value: stats.total_employees },
                    { label: 'Pending', value: stats.pending_allowances },
                    { label: 'Approved Today', value: stats.approved_today },
                    { label: 'Distance Today', value: stats.total_distance_today },
                    { label: 'Monthly Allowance', value: stats.monthly_allowance },
                    { label: 'Monthly Visits', value: stats.monthly_visits }
                ].map((item, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card>
                            <CardContent>
                                <Typography>{item.label}</Typography>
                                <Typography variant="h5">{item.value || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* GRAPH */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Distance Trend</Typography>
                    <DistanceTrendChart data={stats.distance_trend || []} />
                </CardContent>
            </Card>

            {/* RECENT PUNCHES */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Recent Punches</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Distance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(stats.recent_punches || []).map((p, i) => (
                                <TableRow key={i}>
                                    <TableCell>{p.employee__employee_id}</TableCell>
                                    <TableCell>{p.punch_type}</TableCell>
                                    <TableCell>{new Date(p.punched_at).toLocaleString()}</TableCell>
                                    <TableCell>{p.distance_from_last}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* RECENT ALLOWANCES */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6">Recent Allowances</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(stats.recent_allowances || []).map((a, i) => (
                                <TableRow key={i}>
                                    <TableCell>{a.employee__employee_id}</TableCell>
                                    <TableCell>{a.total_distance}</TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </Box>
    );
};

export default AdminDashboard;