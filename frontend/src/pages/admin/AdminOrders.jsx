import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { orderService } from '../../api/services';
import toast from 'react-hot-toast';
import './Admin.css';

const statusColors = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
};

const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => { loadOrders(); }, [filter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const params = { limit: 50 };
            if (filter) params.status = filter;
            const res = await orderService.getAll(params);
            setOrders(res.data.orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, { status: newStatus });
            toast.success('Order status updated');
            loadOrders();
        } catch (err) {
            toast.error('Failed to update status');
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
                    <Link to="/admin/orders" className="admin-nav-item active"><FiPackage /> Orders</Link>
                    <Link to="/admin/users" className="admin-nav-item"><FiUsers /> Users</Link>
                </nav>
                <Link to="/" className="admin-nav-item admin-back-link">← Back to Store</Link>
            </div>

            <div className="admin-main">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">Orders</h1>
                    <select className="form-input" style={{ width: 200 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        {allStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <div>{order.customer_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>{order.shipping_phone}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                                            {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                                        </div>
                                    </td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td className="price">${parseFloat(order.total).toFixed(2)}</td>
                                    <td>
                                        <select
                                            className="form-input"
                                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 'auto', minWidth: '120px' }}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            {allStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        {new Date(order.created_at).toLocaleDateString()}
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
