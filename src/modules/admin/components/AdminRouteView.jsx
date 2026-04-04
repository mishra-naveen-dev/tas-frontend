import React, { useState, useEffect, Suspense } from 'react';
import {
    Box, TextField, Button, Stack, Typography, CircularProgress
} from '@mui/material';

const MapView = React.lazy(() => import('modules/attendance/components/MapView'));

const AdminRouteView = ({ employee }) => {

    const getToday = () => new Date().toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        from: getToday(),
        to: getToday()
    });

    const [filteredPunches, setFilteredPunches] = useState([]);

    const applyFilter = () => {
        if (!employee?.records) return;

        let records = [...employee.records];

        if (filters.from) {
            records = records.filter(r =>
                new Date(r.punched_at) >= new Date(filters.from)
            );
        }

        if (filters.to) {
            records = records.filter(r =>
                new Date(r.punched_at) <= new Date(filters.to + "T23:59:59")
            );
        }

        setFilteredPunches(records);
    };

    useEffect(() => {
        applyFilter();
    }, [filters, employee]);

    return (
        <Box>

            <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">

                <TextField
                    type="date"
                    size="small"
                    value={filters.from}
                    onChange={(e) =>
                        setFilters(p => ({ ...p, from: e.target.value }))
                    }
                />

                <TextField
                    type="date"
                    size="small"
                    value={filters.to}
                    onChange={(e) =>
                        setFilters(p => ({ ...p, to: e.target.value }))
                    }
                />

                <Button variant="contained" onClick={applyFilter}>
                    Apply
                </Button>

            </Stack>

            <Typography mb={1}>
                Showing {filteredPunches.length} points
            </Typography>

            <Suspense fallback={<CircularProgress />}>
                <MapView punches={filteredPunches} />
            </Suspense>

        </Box>
    );
};

export default AdminRouteView;