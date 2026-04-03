import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import api from 'core/services/api';

const ActivityTab = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await api.getDailySummary();
        setData(res.data);
    };

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3}>

                    <Grid item xs={4}>
                        <Typography variant="subtitle2">Punch Count</Typography>
                        <Typography variant="h6">{data?.punch_count || 0}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="subtitle2">Distance Today</Typography>
                        <Typography variant="h6">
                            {data?.total_distance_today || 0} km
                        </Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="subtitle2">Working Duration</Typography>
                        <Typography variant="h6">
                            {data?.duration || '--'}
                        </Typography>
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
    );
};

export default ActivityTab;