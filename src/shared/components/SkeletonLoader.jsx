import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <Box>
        <Skeleton variant="rectangular" height={45} sx={{ mb: 0.5, borderRadius: 1 }} />
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
        ))}
    </Box>
);

export const CardSkeleton = ({ count = 3 }) => (
    <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Skeleton variant="text" width="60%" height={28} />
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="rectangular" height={80} sx={{ mt: 1, borderRadius: 1 }} />
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
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 1 }} />
                        <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width="40%" height={18} sx={{ mx: 'auto' }} />
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
);

export const MapSkeleton = ({ height = 400 }) => (
    <Box sx={{ height, borderRadius: 2, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
    </Box>
);

export const FormSkeleton = ({ fields = 4 }) => (
    <Stack spacing={2}>
        {Array.from({ length: fields }).map((_, i) => (
            <Box key={i}>
                <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Box>
        ))}
    </Stack>
);

export const ListSkeleton = ({ items = 5, avatar = true }) => (
    <Stack spacing={1}>
        {Array.from({ length: items }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                {avatar && <Skeleton variant="circular" width={40} height={40} />}
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={22} />
                    <Skeleton variant="text" width="40%" height={18} />
                </Box>
                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            </Box>
        ))}
    </Stack>
);

export const ChartSkeleton = () => (
    <Card sx={{ borderRadius: 2 }}>
        <CardContent>
            <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
        </CardContent>
    </Card>
);

export const AlertSkeleton = () => (
    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
);

export const PageSkeleton = ({ hasStats = true, hasTable = true, hasChart = false }) => (
    <Box>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={350} height={22} sx={{ mb: 3 }} />
        
        {hasStats && <StatsSkeleton count={4} />}
        
        {hasChart && <Box sx={{ mt: 3 }}><ChartSkeleton /></Box>}
        
        {hasTable && <Box sx={{ mt: 3 }}><TableSkeleton rows={6} columns={5} /></Box>}
    </Box>
);

export const DetailPageSkeleton = () => (
    <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={300} height={22} sx={{ mb: 3 }} />
        
        <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                            <Skeleton variant="text" width={80} height={18} />
                            <Skeleton variant="text" width="70%" height={24} />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
        
        <TableSkeleton rows={5} columns={4} />
    </Box>
);

export const TimelineSkeleton = ({ items = 5 }) => (
    <Stack spacing={2}>
        {Array.from({ length: items }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="50%" height={18} />
                    <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 1 }} />
                </Box>
            </Box>
        ))}
    </Stack>
);

export default {
    TableSkeleton,
    CardSkeleton,
    StatsSkeleton,
    MapSkeleton,
    FormSkeleton,
    ListSkeleton,
    ChartSkeleton,
    AlertSkeleton,
    PageSkeleton,
    DetailPageSkeleton,
    TimelineSkeleton,
};
