import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    TextField
} from '@mui/material';

import {
    People,
    Assignment,
    LocationOn,
    TrendingUp,
    PendingActions,
    CurrencyRupee
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import api from 'core/services/api';

import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

// ================= KPI CARD =================
const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 3 }}>
        <CardContent>
            <Stack direction="row" justifyContent="space-between">
                <Box>
                    <Typography variant="body2">{title}</Typography>
                    <Typography variant="h5" fontWeight="bold" color={color}>
                        {value}
                    </Typography>
                </Box>
                {icon}
            </Stack>
        </CardContent>
    </Card>
);

const COLORS = ['#1976d2', '#2e7d32', '#d32f2f'];

const AdminDashboard = () => {

    const navigate = useNavigate();

    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);

    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });

    // ================= LOAD =================
    const loadDashboard = useCallback(async () => {
        try {
            const [usersRes, punchesRes, approvalsRes] = await Promise.all([
                api.getUsers(),
                api.getPunchRecords(dateRange),
                api.getPendingApprovals()
            ]);

            const usersData = usersRes?.data || {};
            const users = usersData.results || usersData || [];
            const punches = punchesRes?.data?.results || punchesRes?.data || [];
            const approvals = approvalsRes?.data?.results || approvalsRes?.data || [];

            // ================= ENTERPRISE MAP =================
            const map = {};

            // 🔥 USERS FIRST
            users.forEach(u => {
                const key = String(u.employee_id || u.id);

                map[key] = {
                    id: key,
                    name: `${u.first_name || ''} ${u.last_name || ''}`,
                    distance: 0,
                    collection: 0,
                    disbursement: 0,
                    punches: 0
                };
            });

            let totalDistance = 0;
            let collection = 0;
            let disbursement = 0;

            const activeSet = new Set();

            // 🔥 PROCESS PUNCHES (WITH FALLBACK)
            punches.forEach(p => {

                const empId = String(
                    p.employee_details?.employee_id ||
                    p.employee_id ||
                    p.employee_details?.id ||
                    p.employee ||
                    ''
                );

                if (!empId) return;

                activeSet.add(empId);

                // 🔥 fallback creation
                if (!map[empId]) {
                    map[empId] = {
                        id: empId,
                        name: `Employee ${empId}`,
                        distance: 0,
                        collection: 0,
                        disbursement: 0,
                        punches: 0
                    };
                }

                const emp = map[empId];

                const distance = Number(p.distance_from_last) || 0;
                const amount = Number(p.amount) || 0;

                emp.distance += distance;
                emp.punches += 1;

                totalDistance += distance;

                if (p.visit_type === 'COLLECTION') {
                    emp.collection += amount;
                    collection += amount;
                }

                if (p.visit_type === 'DISBURSEMENT') {
                    emp.disbursement += amount;
                    disbursement += amount;
                }
            });

            const totalEmployees = Math.max(
                usersData.count || users.length,
                Object.keys(map).length
            );

            const activeEmployees = activeSet.size;

            // ================= TODAY PUNCH =================
            const today = new Date().toDateString();

            const todayPunches = punches.filter(p =>
                new Date(p.punched_at).toDateString() === today
            ).length;

            // ================= TREND =================
            const trendMap = {};

            punches.forEach(p => {
                const day = new Date(p.punched_at).toLocaleDateString();

                if (!trendMap[day]) {
                    trendMap[day] = { day, collection: 0, disbursement: 0 };
                }

                if (p.visit_type === 'COLLECTION') {
                    trendMap[day].collection += Number(p.amount) || 0;
                }

                if (p.visit_type === 'DISBURSEMENT') {
                    trendMap[day].disbursement += Number(p.amount) || 0;
                }
            });

            setChartData(Object.values(trendMap));

            setStats({
                totalEmployees,
                activeEmployees,
                todayPunches,
                pendingApprovals: approvals.length,
                totalDistance: totalDistance.toFixed(2),
                collection,
                disbursement
            });

        } catch (err) {
            console.error("Dashboard Error:", err);
        }
    }, [dateRange]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const netCash = useMemo(() => {
        return (stats.collection || 0) - (stats.disbursement || 0);
    }, [stats]);

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" fontWeight="bold" mb={3}>
                Admin Dashboard
            </Typography>

            {/* ================= FILTER ================= */}
            <Stack direction="row" spacing={2} mb={3}>
                <TextField
                    type="date"
                    size="small"
                    onChange={(e) =>
                        setDateRange(prev => ({ ...prev, from: e.target.value }))
                    }
                />

                <TextField
                    type="date"
                    size="small"
                    onChange={(e) =>
                        setDateRange(prev => ({ ...prev, to: e.target.value }))
                    }
                />

                <Button variant="contained" onClick={loadDashboard}>
                    Apply
                </Button>
            </Stack>

            {/* ================= KPI ================= */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <StatCard title="Employees" value={stats.totalEmployees} icon={<People />} />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Active" value={stats.activeEmployees} icon={<TrendingUp />} color="green" />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Punches Today" value={stats.todayPunches} icon={<Assignment />} />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Distance (KM)" value={stats.totalDistance} icon={<LocationOn />} />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Pending" value={stats.pendingApprovals} icon={<PendingActions />} color="orange" />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Collection" value={`₹ ${stats.collection}`} icon={<CurrencyRupee />} color="green" />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Disbursement" value={`₹ ${stats.disbursement}`} icon={<CurrencyRupee />} color="red" />
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard title="Net Cash" value={`₹ ${netCash}`} icon={<TrendingUp />} color={netCash >= 0 ? "green" : "red"} />
                </Grid>
            </Grid>

            {/* ================= CHART ================= */}
            <Grid container spacing={3} mt={2}>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Cash Flow Trend</Typography>

                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line dataKey="collection" stroke="#2e7d32" />
                                    <Line dataKey="disbursement" stroke="#d32f2f" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Approval Status</Typography>

                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Approved', value: 60 },
                                            { name: 'Pending', value: 30 },
                                            { name: 'Rejected', value: 10 }
                                        ]}
                                        dataKey="value"
                                        outerRadius={80}
                                        label
                                    >
                                        {COLORS.map((c, i) => (
                                            <Cell key={i} fill={c} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

        </Box>
    );

};

export default AdminDashboard;