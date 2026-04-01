import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const DistanceTrendChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="distance" stroke="#1976d2" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DistanceTrendChart;