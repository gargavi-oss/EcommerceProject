import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiBell, FiTrendingUp } from 'react-icons/fi';
import { adminService } from '../../api/services';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
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

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
        loadNotifications();

        // Socket.IO connection
        const socket = io('http://localhost:8000');
        socket.emit('join_admin');

        socket.on('new_order', (data) => {
            toast.success(`🔔 New order #${data.id} from ${data.customer_name}!`, { duration: 5000 });
            setUnreadCount(prev => prev + 1);
            loadDashboard();
            loadNotifications();
        });

        return () => socket.disconnect();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await adminService.getDashboard();
            setStats(res.data.stats);
            setRecentOrders(res.data.recent_orders);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            const res = await adminService.getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await adminService.markRead(id);
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await adminService.markAllRead();
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const parseNotificationMessage = (msg) => {
        try { return JSON.parse(msg); }
        catch { return null; }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="admin-page">
            <div className="admin-sidebar glass">
                <div className="admin-sidebar-brand">
                    <span>🛒</span> <span className="gradient-text">Admin</span>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item active"><FiTrendingUp /> Dashboard</Link>
                    <Link to="/admin/products" className="admin-nav-item"><FiShoppingBag /> Products</Link>
                    <Link to="/admin/orders" className="admin-nav-item"><FiPackage /> Orders</Link>
                    <Link to="/admin/users" className="admin-nav-item"><FiUsers /> Users</Link>
                </nav>
                <Link to="/" className="admin-nav-item admin-back-link">← Back to Store</Link>
            </div>

            <div className="admin-main">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">Dashboard</h1>
                    <div className="admin-topbar-actions">
                        <div className="notification-wrapper">
                            <button className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                                <FiBell />
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown glass">
                                    <div className="notification-dropdown-header">
                                        <h3>Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button className="btn btn-sm btn-outline" onClick={markAllRead}>Mark all read</button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <p className="no-notifications">No notifications</p>
                                        ) : (
                                            notifications.slice(0, 20).map(notif => {
                                                const details = parseNotificationMessage(notif.message);
                                                return (
                                                    <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                                        onClick={() => !notif.is_read && markAsRead(notif.id)}>
                                                        <div className="notification-item-header">
                                                            <span className="notification-title">{notif.title}</span>
                                                            <span className="notification-time">
                                                                {new Date(notif.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {details && (
                                                            <div className="notification-details">
                                                                <p><strong>Customer:</strong> {details.customer_name}</p>
                                                                <p><strong>Email:</strong> {details.customer_email}</p>
                                                                <p><strong>Phone:</strong> {details.customer_phone}</p>
                                                                <p><strong>Address:</strong> {details.customer_address}</p>
                                                                <p><strong>Total:</strong> <span className="notification-total">{formatPrice(details.total)}</span></p>
                                                                <div className="notification-items">
                                                                    {details.items?.map((item, i) => (
                                                                        <span key={i} className="notification-product">{item.name} ×{item.quantity}</span>
                                                                    ))}
                                                                </div>
                                                                {details.notes && <p className="notification-notes"><strong>Notes:</strong> {details.notes}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin-user-info">
                            <span className="admin-user-name">{user?.name}</span>
                            <span className="badge badge-primary">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card glass">
                        <div className="stat-card-icon" style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--primary-light)' }}><FiDollarSign /></div>
                        <div className="stat-card-info">
                            <p className="stat-card-label">Total Revenue</p>
                            <h2 className="stat-card-value">{formatPrice(stats?.total_revenue || 0)}</h2>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-card-icon" style={{ background: 'rgba(0, 206, 201, 0.15)', color: 'var(--secondary)' }}><FiPackage /></div>
                        <div className="stat-card-info">
                            <p className="stat-card-label">Total Orders</p>
                            <h2 className="stat-card-value">{stats?.total_orders}</h2>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-card-icon" style={{ background: 'rgba(253, 121, 168, 0.15)', color: 'var(--accent)' }}><FiShoppingBag /></div>
                        <div className="stat-card-info">
                            <p className="stat-card-label">Products</p>
                            <h2 className="stat-card-value">{stats?.total_products}</h2>
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-card-icon" style={{ background: 'rgba(0, 184, 148, 0.15)', color: 'var(--success)' }}><FiUsers /></div>
                        <div className="stat-card-info">
                            <p className="stat-card-label">Customers</p>
                            <h2 className="stat-card-value">{stats?.total_users}</h2>
                        </div>
                    </div>
                </div>

                {/* Pending Orders Alert */}
                {stats?.pending_orders > 0 && (
                    <div className="pending-alert glass">
                        <span>⚠️ You have <strong>{stats.pending_orders}</strong> pending orders. </span>
                        <Link to="/admin/orders" className="btn btn-sm btn-primary">View Orders</Link>
                    </div>
                )}

                {/* Recent Orders */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <h2>Recent Orders</h2>
                        <Link to="/admin/orders" className="section-link">View All →</Link>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>#{order.id}</strong></td>
                                        <td>
                                            <div>{order.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                                        </td>
                                        <td className="price">{formatPrice(order.total)}</td>
                                        <td><span className={`badge ${statusColors[order.status]}`}>{order.status}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
