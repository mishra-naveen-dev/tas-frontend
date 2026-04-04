import React, { useMemo, Suspense } from 'react';
import { Typography, CircularProgress } from '@mui/material';

const MapView = React.lazy(() => import('modules/attendance/components/MapView'));

const EmployeeRouteView = ({ employee }) => {

    const getToday = () => new Date().toISOString().split('T')[0];

    const todayPunches = useMemo(() => {
        if (!employee?.records) return [];

        return employee.records.filter(r =>
            new Date(r.punched_at).toISOString().split('T')[0] === getToday()
        );
    }, [employee]);

    return (
        <>
            <Typography mb={1}>
                Showing {todayPunches.length} points (Today only)
            </Typography>

            <Suspense fallback={<CircularProgress />}>
                <MapView punches={todayPunches} />
            </Suspense>
        </>
    );
};

export default EmployeeRouteView;