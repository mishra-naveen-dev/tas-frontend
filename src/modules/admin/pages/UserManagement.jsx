import React, { useEffect, useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, CircularProgress, Avatar, Stack, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Block as BlockIcon, CheckCircle as ActiveIcon } from '@mui/icons-material';
import api from 'core/services/api';
import { TableSkeleton } from 'shared/components/SkeletonLoader';
import useDebounce from 'shared/hooks/useDebounce';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.getUsers();
            setUsers(res.data.results || res.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = useMemo(() => {
        if (!debouncedSearch) return users;
        const searchLower = debouncedSearch.toLowerCase();
        return users.filter(user =>
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.employee_id?.toLowerCase().includes(searchLower)
        );
    }, [users, debouncedSearch]);

    const handleDelete = async () => {
        if (!deleteDialog.user) return;
        setDeleteLoading(true);
        try {
            await api.deleteUser(deleteDialog.user.id);
            setUsers(prev => prev.filter(u => u.id !== deleteDialog.user.id));
            setDeleteDialog({ open: false, user: null });
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">User Management</Typography>
                    <Typography variant="caption" color="text.secondary">Manage employee accounts and permissions</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />}>Add User</Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ p: 2 }}><TableSkeleton rows={8} columns={5} /></Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Employee ID</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Branch</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">No users found</Typography></TableCell></TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{user.first_name?.[0] || 'U'}</Avatar>
                                                    <Box>
                                                        <Typography variant="body2">{user.first_name} {user.last_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.employee_id || 'N/A'}</TableCell>
                                            <TableCell><Chip label={user.role_name || 'N/A'} size="small" variant="outlined" color={user.role_name === 'ADMIN' ? 'primary' : 'default'} /></TableCell>
                                            <TableCell>{user.branch_name || user.branch || 'N/A'}</TableCell>
                                            <TableCell><Chip icon={user.is_active ? <ActiveIcon /> : <BlockIcon />} label={user.is_active ? 'Active' : 'Inactive'} size="small" color={user.is_active ? 'success' : 'error'} /></TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Edit"><IconButton size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, user })}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete user <strong>{deleteDialog.user?.username}</strong>?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" disabled={deleteLoading}>{deleteLoading ? <CircularProgress size={24} /> : 'Delete'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
