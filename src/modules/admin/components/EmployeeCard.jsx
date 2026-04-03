import React from 'react';
import {
    Card, CardContent, Typography,
    Grid, Chip, Button, Box
} from '@mui/material';

import MapIcon from '@mui/icons-material/Map';

const EmployeeCard = ({ employee, onView, onRoute }) => {

    const isActive = employee.todayPunches > 0;

    return (
        <Card sx={{
            borderRadius: 3,
            opacity: isActive ? 1 : 0.7,
            border: isActive ? '1px solid #e0e0e0' : '1px dashed #ccc'
        }}>
            <CardContent>

                {/* HEADER */}
                <Box display="flex" justifyContent="space-between">
                    <Box>
                        <Typography fontWeight="bold">
                            {employee.name}
                        </Typography>
                        <Typography variant="body2">
                            ID: {employee.id}
                        </Typography>
                    </Box>

                    <Chip
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? "success" : "default"}
                        size="small"
                    />
                </Box>

                {/* STATS */}
                <Grid container spacing={1} mt={1}>
                    <Grid item xs={6}>
                        <Typography variant="caption">Punches</Typography>
                        <Typography>{employee.todayPunches}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption">Distance</Typography>
                        <Typography>{employee.distance.toFixed(2)} km</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption">Collection</Typography>
                        <Typography>₹ {employee.collection}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption">Disbursement</Typography>
                        <Typography>₹ {employee.disbursement}</Typography>
                    </Grid>
                </Grid>

                {/* FOOTER */}
                <Box mt={2}>
                    <Typography variant="caption">
                        Last Activity: {
                            employee.lastPunch
                                ? new Date(employee.lastPunch).toLocaleString()
                                : 'No activity'
                        }
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => onView(employee)}
                    >
                        View Details
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        startIcon={<MapIcon />}
                        onClick={() => onRoute(employee)}
                    >
                        View Route
                    </Button>
                </Box>

            </CardContent>
        </Card>
    );

};

export default EmployeeCard;