import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiUsers, FiTrendingUp, FiTrash2 } from 'react-icons/fi';
import { adminService } from '../../api/services';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await adminService.getUsers();
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, { role: newRole });
            toast.success('User role updated');
            loadUsers();
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted');
            loadUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="admin-page">
            <div className="admin-sidebar glass">
                <div className="admin-sidebar-brand"><span>🛒</span> <span className="gradient-text">Admin</span></div>
                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item"><FiTrendingUp /> Dashboard</Link>
                    <Link to="/admin/products" className="admin-nav-item"><FiShoppingBag /> Products</Link>
                    <Link to="/admin/orders" className="admin-nav-item"><FiPackage /> Orders</Link>
                    <Link to="/admin/users" className="admin-nav-item active"><FiUsers /> Users</Link>
                </nav>
                <Link to="/" className="admin-nav-item admin-back-link">← Back to Store</Link>
            </div>

            <div className="admin-main">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{users.length} total users</p>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>#{u.id}</td>
                                    <td><strong>{u.name}</strong></td>
                                    <td>{u.email}</td>
                                    <td>{u.phone || '—'}</td>
                                    <td>
                                        <select
                                            className="form-input"
                                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(u.id)} title="Delete user">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
