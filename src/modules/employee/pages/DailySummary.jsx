import React, { useEffect, useState, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography,
    Table, TableHead, TableRow, TableCell,
    TableBody, Skeleton, Alert, Chip,
    Grid, ToggleButton, ToggleButtonGroup,
    TextField
} from '@mui/material';

import api from 'core/services/api';
import DistanceChart from 'modules/attendance/components/DistanceChart';

const DailySummary = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('table');

    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: ''
    });

    // ================= FETCH =================
    const fetchSummary = async () => {
        try {
            setLoading(true);

            const res = await api.getDailySummaryReport?.()
                || await api.getDailySummary();

            const result = res?.data?.results || res?.data || [];

            if (!result.length) {
                setData([
                    {
                        date: "2026-04-01",
                        punch_count: 5,
                        first_punch: "09:15",
                        last_punch: "18:10",
                        total_distance: 12.5,
                        duration: "8h 30m",
                        collection: 2500
                    },
                    {
                        date: "2026-03-31",
                        punch_count: 3,
                        first_punch: "10:00",
                        last_punch: "16:00",
                        total_distance: 6.2,
                        duration: "5h 30m",
                        collection: 1200
                    }
                ]);
            } else {
                setData(result);
            }

            setError(null);

        } catch (err) {
            console.error(err);
            setError("Failed to load summary");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // ================= FILTER =================
    const filteredData = useMemo(() => {
        return data.filter(d => {
            if (!dateFilter.from && !dateFilter.to) return true;

            const date = new Date(d.date);

            if (dateFilter.from && date < new Date(dateFilter.from)) return false;
            if (dateFilter.to && date > new Date(dateFilter.to)) return false;

            return true;
        });
    }, [data, dateFilter]);

    // ================= KPI =================
    const kpi = useMemo(() => {
        return {
            days: filteredData.length,
            totalDistance: filteredData.reduce((s, d) => s + (Number(d.total_distance) || 0), 0),
            totalCollection: filteredData.reduce((s, d) => s + (Number(d.collection) || 0), 0),
        };
    }, [filteredData]);

    // ================= CHART DATA =================
    const chartData = useMemo(() => {
        return filteredData.map(d => ({
            day: new Date(d.date).toLocaleDateString(),
            distance: Number(d.total_distance) || 0
        }));
    }, [filteredData]);

    const safe = (v) => (v ? Number(v).toFixed(2) : '0.00');

    const getStatus = (d) => {
        if (d.punch_count === 0) return 'No Activity';
        if (d.total_distance > 10) return 'Active';
        return 'Low Activity';
    };

    return (
        <Box sx={{ p: 3 }}>

            <Typography variant="h5" sx={{ mb: 2 }}>
                Daily Summary Report
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ================= FILTER ================= */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                    <TextField
                        type="date"
                        label="From"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={dateFilter.from}
                        onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                    />
                </Grid>

                <Grid item xs={6} md={3}>
                    <TextField
                        type="date"
                        label="To"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={dateFilter.to}
                        onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                    />
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={(e, val) => val && setView(val)}
                    >
                        <ToggleButton value="table">Table</ToggleButton>
                        <ToggleButton value="chart">Chart</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            {/* ================= KPI ================= */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <Card><CardContent>
                        <Typography>Total Days</Typography>
                        <Typography variant="h6">{kpi.days}</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={4}>
                    <Card><CardContent>
                        <Typography>Total Distance</Typography>
                        <Typography variant="h6">{safe(kpi.totalDistance)} km</Typography>
                    </CardContent></Card>
                </Grid>

                <Grid item xs={4}>
                    <Card><CardContent>
                        <Typography>Total Collection</Typography>
                        <Typography variant="h6">₹ {safe(kpi.totalCollection)}</Typography>
                    </CardContent></Card>
                </Grid>
            </Grid>

            {/* ================= CONTENT ================= */}
            <Card>
                <CardContent>

                    {loading ? (
                        <Skeleton height={200} />
                    ) : view === 'chart' ? (
                        <DistanceChart data={chartData} />
                    ) : (
                        <Table size="small">

                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Punch Count</TableCell>
                                    <TableCell>First Punch</TableCell>
                                    <TableCell>Last Punch</TableCell>
                                    <TableCell>Distance</TableCell>
                                    <TableCell>Working Time</TableCell>
                                    <TableCell>Collection</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((d, i) => {
                                        const status = getStatus(d);

                                        return (
                                            <TableRow key={i} hover>

                                                <TableCell>
                                                    {new Date(d.date).toLocaleDateString()}
                                                </TableCell>

                                                <TableCell>{d.punch_count}</TableCell>

                                                <TableCell>{d.first_punch || '--'}</TableCell>

                                                <TableCell>{d.last_punch || '--'}</TableCell>

                                                <TableCell>{safe(d.total_distance)} km</TableCell>

                                                <TableCell>{d.duration || '--'}</TableCell>

                                                <TableCell>₹ {safe(d.collection)}</TableCell>

                                                <TableCell>
                                                    <Chip
                                                        label={status}
                                                        color={
                                                            status === 'Active'
                                                                ? 'success'
                                                                : status === 'Low Activity'
                                                                    ? 'warning'
                                                                    : 'default'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>

                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>

                        </Table>
                    )}

                </CardContent>
            </Card>

        </Box>
    );

};

export default DailySummary;