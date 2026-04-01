import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await api.getUsers();
        setUsers(res.data.results || res.data);
    };

    return (
        <div>
            <h2>User Management</h2>

            <button>Add Employee</button>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Role</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.employee_id}</td>
                            <td>{user.role_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;