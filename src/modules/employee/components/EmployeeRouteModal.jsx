import React, { useMemo, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    Typography
} from '@mui/material';

import MapView from 'modules/attendance/components/MapView';

const EmployeeRouteModal = ({ open, onClose, employee, route = [] }) => {

    // ✅ DEFAULT TODAY DATE
    const [date, setDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // ================= FILTER =================
    const filteredRoute = useMemo(() => {

        if (!route.length) return [];

        return route.filter(p => {

            if (!p.punched_at) return false;

            const punchDate =
                new Date(p.punched_at).toISOString().split('T')[0];

            return (
                punchDate === date &&
                p.latitude &&
                p.longitude
            );

        });

    }, [route, date]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

            <DialogTitle>
                {employee?.name} - Route Map
            </DialogTitle>

            <DialogContent>

                {/* DATE FILTER */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        type="date"
                        label="Select Date"
                        size="small"
                        value={date}
                        InputLabelProps={{ shrink: true }}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </Box>

                {/* MAP */}
                {filteredRoute.length === 0 ? (
                    <Typography>No route available for selected date</Typography>
                ) : (
                    <MapView punches={filteredRoute} />
                )}

            </DialogContent>

        </Dialog>
    );
};

export default EmployeeRouteModal;