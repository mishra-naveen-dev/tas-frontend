import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';

const DistanceChart = ({ data = [] }) => {

    if (!Array.isArray(data)) return <p>No chart data</p>;

    // 🔥 WEEK DAYS ORDER
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // 🔥 INIT WEEK DATA WITH 0
    const weekMap = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    };

    // 🔥 CONVERT DATE → DAY
    data.forEach((d) => {
        if (!d?.date) return;

        const day = new Date(d.date).toLocaleDateString('en-US', {
            weekday: 'short'
        });

        // Convert Sun, Mon... to Mon-first order
        const mapDay = day === 'Sun' ? 'Sun' : day;

        if (weekMap.hasOwnProperty(mapDay)) {
            weekMap[mapDay] += Number(d.distance || 0);
        }
    });

    // 🔥 FORMAT FOR CHART
    const formatted = weekDays.map((day) => ({
        day,
        distance: Number(weekMap[day].toFixed(2))
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatted}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="day" />
                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#d32f2f"
                    strokeWidth={2}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DistanceChart;