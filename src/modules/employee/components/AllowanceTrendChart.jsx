import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ResponsiveContainer
} from 'recharts';

import { Box, Typography } from '@mui/material';

// ================= TOOLTIP =================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                background: '#fff',
                p: 1.5,
                borderRadius: 2,
                boxShadow: 2,
                fontSize: 12
            }}>
                <Typography variant="caption">{label}</Typography>

                <Typography color="primary">
                    🚗 Distance: {payload[0]?.value} km
                </Typography>

                <Typography color="success.main">
                    💰 Amount: ₹ {payload[1]?.value}
                </Typography>
            </Box>
        );
    }
    return null;

};

// ================= MAIN =================
const AllowanceTrendChart = ({ data = [] }) => {

    // ✅ fallback if empty
    const chartData = data.length
        ? data
        : [
            { day: 'Mon', distance: 5, amount: 500 },
            { day: 'Tue', distance: 8, amount: 1200 },
            { day: 'Wed', distance: 6, amount: 800 },
            { day: 'Thu', distance: 10, amount: 2000 },
            { day: 'Fri', distance: 7, amount: 1500 },
        ];

    return (
        <Box sx={{ width: '100%', height: 320 }}>

            <ResponsiveContainer>
                <LineChart data={chartData}>

                    {/* GRID */}
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* X AXIS */}
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                    />

                    {/* Y AXIS (DISTANCE) */}
                    <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Distance (km)',
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />

                    {/* Y AXIS (AMOUNT) */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Amount (₹)',
                            angle: 90,
                            position: 'insideRight'
                        }}
                    />

                    {/* TOOLTIP */}
                    <Tooltip content={<CustomTooltip />} />

                    {/* LEGEND */}
                    <Legend />

                    {/* 🚗 DISTANCE LINE */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="distance"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Distance (km)"
                    />

                    {/* 💰 AMOUNT LINE */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amount"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Amount (₹)"
                    />

                </LineChart>
            </ResponsiveContainer>

        </Box>
    );

};

export default AllowanceTrendChart;