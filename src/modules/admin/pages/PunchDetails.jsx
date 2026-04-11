import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Grid, Chip, Divider, Avatar } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import api from 'core/services/api';
import AdvancedFilter from 'shared/components/AdvancedFilter';
import { TableSkeleton } from 'shared/components/SkeletonLoader';
import useDebounce from 'shared/hooks/useDebounce';

const PunchDetails = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        type: '',
        state: '',
        branch: '',
        area: '',
        employee: '',
    });

    const debouncedFilters = useDebounce(filters, 500);

    const fetchPunches = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (debouncedFilters.dateFrom) params.from = debouncedFilters.dateFrom;
            if (debouncedFilters.dateTo) params.to = debouncedFilters.dateTo;
            if (debouncedFilters.state) params.state = debouncedFilters.state;
            if (debouncedFilters.branch) params.branch = debouncedFilters.branch;
            if (debouncedFilters.area) params.area = debouncedFilters.area;
            if (debouncedFilters.employee) params.employee_id = debouncedFilters.employee;

            const res = await api.getPunchRecords(params);
            setData(res?.data?.results || res?.data || []);
        } catch (err) {
            console.error("Error fetching punches:", err);
        } finally {
            setLoading(false);
        }
    }, [debouncedFilters]);

    useEffect(() => { fetchPunches(); }, [fetchPunches]);

    const getEmployee = (p) => ({
        id: p.employee_details?.employee_id || p.employee_id || 'N/A',
        name: p.employee_details?.name || `${p.employee_details?.first_name || ''} ${p.employee_details?.last_name || ''}` || `Emp ${p.employee_id || ''}`
    });

    const safe = (v) => (v ? Number(v).toFixed(2) : '0.00');

    const filteredData = useMemo(() => {
        let result = [...data];
        if (filters.type) result = result.filter(p => p.visit_type === filters.type || p.punch_type === filters.type);
        return result;
    }, [data, filters.type]);

    const groupedData = useMemo(() => {
        const map = {};
        filteredData.forEach(p => {
            const emp = getEmployee(p);
            if (!map[emp.id]) map[emp.id] = { employee_name: emp.name, employee_id: emp.id, punches: [] };
            map[emp.id].punches.push(p);
        });
        return Object.values(map);
    }, [filteredData]);

    const handleFilterApply = (values) => setFilters(prev => ({ ...prev, ...values }));
    const handleFilterClear = () => setFilters({ dateFrom: '', dateTo: '', type: '', state: '', branch: '', area: '', employee: '' });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Employee Punch Details</Typography>

            <AdvancedFilter
                onApply={handleFilterApply}
                onClear={handleFilterClear}
                showDateRange={true}
                showTypeFilter={true}
                typeOptions={[
                    { value: 'PUNCH_IN', label: 'Punch In' },
                    { value: 'PUNCH_OUT', label: 'Punch Out' },
                    { value: 'COLLECTION', label: 'Collection' },
                    { value: 'DISBURSEMENT', label: 'Disbursement' },
                ]}
                compact={true}
            />

            {loading ? (
                <TableSkeleton rows={6} columns={8} />
            ) : groupedData.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No punch records found</Typography></Card>
            ) : (
                <Grid container spacing={3}>
                    {groupedData.map((emp, idx) => (
                        <Grid item xs={12} key={idx}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{emp.employee_name?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="h6">{emp.employee_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{emp.employee_id}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip label={`${emp.punches.length} Punches`} size="small" />
                                            <Chip label={`${emp.punches.reduce((sum, p) => sum + Number(p.distance_from_last || 0), 0).toFixed(2)} km`} size="small" color="primary" />
                                        </Box>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell><strong>#</strong></TableCell>
                                                <TableCell><strong>Type</strong></TableCell>
                                                <TableCell><strong>Date/Time</strong></TableCell>
                                                <TableCell><strong>Distance</strong></TableCell>
                                                <TableCell><strong>Address</strong></TableCell>
                                                <TableCell><strong>Amount</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {emp.punches.map((p, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{i + 1}</TableCell>
                                                    <TableCell><Chip label={p.visit_type || p.punch_type} size="small" color={p.punch_type === 'PUNCH_IN' ? 'success' : p.punch_type === 'PUNCH_OUT' ? 'error' : 'default'} /></TableCell>
                                                    <TableCell>{new Date(p.punched_at).toLocaleString()}</TableCell>
                                                    <TableCell>{safe(p.distance_from_last)} km</TableCell>
                                                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{p.current_address || '--'}</Typography></TableCell>
                                                    <TableCell>{p.amount ? `₹ ${Number(p.amount).toLocaleString()}` : '--'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default PunchDetails;
