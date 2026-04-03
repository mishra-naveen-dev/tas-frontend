import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip
} from '@mui/material';

import api from 'core/services/api';
import { format } from 'date-fns';

const PunchRecords = () => {
    const [punchRecords, setPunchRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPunchRecords();
    }, []);

    const fetchPunchRecords = async () => {
        try {
            setLoading(true);

            const { data } = await api.getTodayPunches();

            setPunchRecords(data.results || data);

        } catch {
            setError('Failed to load punch records');
        } finally {
            setLoading(false);
        }
    };

    const handlePunch = async () => {
        try {
            setLoading(true);
            setError('');

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            await api.createPunchRecord({
                punch_type: 'PUNCH_IN',
                latitude,
                longitude,
            });

            setSuccess('Punch captured successfully');
            fetchPunchRecords();

            setTimeout(() => setSuccess(''), 2000);

        } catch {
            setError('Location permission required');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>

            <Typography variant="h4" sx={{ mb: 3 }}>
                Punch Records
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Punch Button */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h6">Capture Punch</Typography>

                            <Button
                                variant="contained"
                                onClick={handlePunch}
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                Punch Now
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Table */}
            <TableContainer component={Card}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Distance (km)</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {punchRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No punch records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            punchRecords.map((record) => (
                                <TableRow key={record.id}>

                                    <TableCell>
                                        {record.punched_at
                                            ? format(new Date(record.punched_at), 'dd MMM yyyy')
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        {record.punched_at
                                            ? format(new Date(record.punched_at), 'HH:mm:ss')
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={record.punch_type || 'N/A'}
                                            color={record.punch_type === 'PUNCH_IN' ? 'success' : 'primary'}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {record.latitude && record.longitude
                                            ? `${Number(record.latitude).toFixed(5)}, ${Number(record.longitude).toFixed(5)}`
                                            : '--'}
                                    </TableCell>

                                    <TableCell>
                                        {Number(record.distance_from_last || 0).toFixed(2)}
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {loading && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default PunchRecords;