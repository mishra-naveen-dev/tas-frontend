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

const EmployeeRouteModal = ({ open, onClose, employee, allPunches }) => {

    const [date, setDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // ================= FILTER ROUTE =================
    const routeData = useMemo(() => {
        if (!employee) return [];

        return allPunches.filter(p => {

            const empId =
                p.employee_details?.employee_id ||
                p.employee_id ||
                '';

            const punchDate =
                new Date(p.punched_at).toISOString().split('T')[0];

            return (
                empId === employee.employee_id &&
                punchDate === date &&
                p.latitude && p.longitude
            );
        });
    }, [employee, allPunches, date]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

            <DialogTitle>
                {employee?.employee_name || employee?.name} - Route Map
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
                {routeData.length === 0 ? (
                    <Typography>No route data available</Typography>
                ) : (
                    <MapView punches={routeData} />
                )}

            </DialogContent>

        </Dialog>
    );

};

export default EmployeeRouteModal;