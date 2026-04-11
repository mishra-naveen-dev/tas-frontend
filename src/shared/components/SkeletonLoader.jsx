import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <Box>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 0.5 }} />
        ))}
    </Box>
);

export const CardSkeleton = ({ count = 3 }) => (
    <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
);

export const StatsSkeleton = ({ count = 4 }) => (
    <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
            <Grid item xs={6} sm={3} key={i}>
                <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width="30%" sx={{ mx: 'auto' }} />
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
);

export const MapSkeleton = () => (
    <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height="100%" />
    </Box>
);

export const PageSkeleton = () => (
    <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
        <StatsSkeleton count={4} />
        <Box sx={{ mt: 3 }}>
            <TableSkeleton rows={5} columns={5} />
        </Box>
    </Box>
);

export default {
    TableSkeleton,
    CardSkeleton,
    StatsSkeleton,
    MapSkeleton,
    PageSkeleton,
};
