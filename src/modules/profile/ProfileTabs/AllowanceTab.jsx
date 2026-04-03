import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip
} from '@mui/material';
import api from 'core/services/api';

const AllowanceTab = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await api.getAllowanceRequests();
        setData(res.data.results || res.data);
    };

    const getColor = (status) => {
        if (status === 'PENDING') return 'warning';
        if (status === 'APPROVED') return 'success';
        return 'default';
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Allowance History
                </Typography>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.travel_date}</TableCell>
                                <TableCell>{row.from_location}</TableCell>
                                <TableCell>{row.to_location}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={getColor(row.status)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AllowanceTab;