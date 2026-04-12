import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { People, Assignment, LocationOn, TrendingUp, PendingActions, CurrencyRupee } from '@mui/icons-material';
import api from 'core/services/api';
import AdvancedFilter from 'shared/components/AdvancedFilter';
import { StatsSkeleton } from 'shared/components/SkeletonLoader';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Legend, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 3 }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                    <Typography variant="h5" fontWeight="bold" color={color || 'primary'}>{value ?? 0}</Typography>
                </Box>
                {icon}
            </Box>
        </CardContent>
    </Card>
);

const COLORS = ['#1976d2', '#2e7d32', '#d32f2f'];

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        todayPunches: 0,
        pendingApprovals: 0,
        totalDistance: '0.00',
        collection: 0,
        disbursement: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        state: '',
        branch: '',
        area: '',
        employee: '',
    });

    const isFetching = useRef(false);

    const loadDashboard = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        
        if (initialLoad) setLoading(true);
        
        try {
            const params = {};
            if (filters.dateFrom) params.from = filters.dateFrom;
            if (filters.dateTo) params.to = filters.dateTo;
            if (filters.state) params.state = filters.state;
            if (filters.branch) params.branch = filters.branch;
            if (filters.area) params.area = filters.area;
            if (filters.employee) params.employee = filters.employee;

            const [usersRes, punchesRes, approvalsRes] = await Promise.all([
                api.getUsers(params).catch(() => ({ data: [] })),
                api.getPunchRecords(params).catch(() => ({ data: { results: [], data: [] } })),
                api.getPendingApprovals(params).catch(() => ({ data: [] }))
            ]);

            const usersData = usersRes?.data || {};
            const users = usersData.results || usersData || [];
            const punches = punchesRes?.data?.results || punchesRes?.data || [];
            const approvals = approvalsRes?.data?.results || approvalsRes?.data || [];

            const map = {};
            users.forEach(u => {
                const key = String(u.employee_id || u.id);
                map[key] = { id: key, name: `${u.first_name || ''} ${u.last_name || ''}`, distance: 0, collection: 0, disbursement: 0, punches: 0 };
            });

            let totalDistance = 0, collection = 0, disbursement = 0;
            const activeSet = new Set();

            punches.forEach(p => {
                const empId = String(p.employee_details?.employee_id || p.employee_id || p.employee_details?.id || p.employee || '');
                if (!empId) return;
                activeSet.add(empId);

                if (!map[empId]) map[empId] = { id: empId, name: `Employee ${empId}`, distance: 0, collection: 0, disbursement: 0, punches: 0 };

                const emp = map[empId];
                const distance = Number(p.distance_from_last) || 0;
                const amount = Number(p.amount) || 0;

                emp.distance += distance;
                emp.punches += 1;
                totalDistance += distance;
                if (p.visit_type === 'COLLECTION') { emp.collection += amount; collection += amount; }
                if (p.visit_type === 'DISBURSEMENT') { emp.disbursement += amount; disbursement += amount; }
            });

            const totalEmployees = Math.max(usersData.count || users.length, Object.keys(map).length);
            const today = new Date().toDateString();
            const todayPunches = punches.filter(p => new Date(p.punched_at).toDateString() === today).length;

            const trendMap = {};
            punches.forEach(p => {
                const day = new Date(p.punched_at).toLocaleDateString();
                if (!trendMap[day]) trendMap[day] = { day, collection: 0, disbursement: 0 };
                if (p.visit_type === 'COLLECTION') trendMap[day].collection += Number(p.amount) || 0;
                if (p.visit_type === 'DISBURSEMENT') trendMap[day].disbursement += Number(p.amount) || 0;
            });

            setChartData(Object.values(trendMap));
            setStats({ 
                totalEmployees, 
                activeEmployees: activeSet.size, 
                todayPunches, 
                pendingApprovals: approvals.length, 
                totalDistance: totalDistance.toFixed(2), 
                collection, 
                disbursement 
            });
        } catch (err) {
            console.error("Dashboard Error:", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
            isFetching.current = false;
        }
    }, [filters, initialLoad]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const netCash = useMemo(() => (stats.collection || 0) - (stats.disbursement || 0), [stats]);

    const handleFilterApply = (values) => {
        setFilters(prev => ({ ...prev, ...values }));
    };
    const handleFilterClear = () => setFilters({ dateFrom: '', dateTo: '', state: '', branch: '', area: '', employee: '' });

    if (initialLoad && loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Admin Dashboard</Typography>
                <StatsSkeleton count={8} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Admin Dashboard</Typography>

            <AdvancedFilter onApply={handleFilterApply} onClear={handleFilterClear} showDateRange={true} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Employees" value={stats.totalEmployees} icon={<People fontSize="large" color="primary" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Active Today" value={stats.activeEmployees} icon={<TrendingUp fontSize="large" color="success" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Punches Today" value={stats.todayPunches} icon={<Assignment fontSize="large" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Distance (KM)" value={stats.totalDistance} icon={<LocationOn fontSize="large" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Pending" value={stats.pendingApprovals} icon={<PendingActions fontSize="large" />} color="warning" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Collection" value={`₹ ${Number(stats.collection || 0).toLocaleString()}`} icon={<CurrencyRupee fontSize="large" />} color="success" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Disbursement" value={`₹ ${Number(stats.disbursement || 0).toLocaleString()}`} icon={<CurrencyRupee fontSize="large" />} color="error" /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Net Cash" value={`₹ ${Number(netCash).toLocaleString()}`} icon={<CurrencyRupee fontSize="large" />} color={netCash >= 0 ? 'success' : 'error'} /></Grid>
            </Grid>

            <Grid container spacing={3} mt={2}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Cash Flow Trend</Typography>
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
                            <Typography variant="h6" gutterBottom>Approval Status</Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={[{ name: 'Approved', value: 60 }, { name: 'Pending', value: stats.pendingApprovals || 10 }, { name: 'Rejected', value: 10 }]} dataKey="value" outerRadius={80} label>
                                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
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
