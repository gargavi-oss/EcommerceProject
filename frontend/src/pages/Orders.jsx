import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { orderService } from '../api/services';
import './Orders.css';

const statusColors = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await orderService.getUserOrders();
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    if (orders.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3 className="empty-state-title">No Orders Yet</h3>
                        <p className="empty-state-text">Start shopping to see your orders here!</p>
                        <Link to="/products" className="btn btn-primary"><FiPackage /> Shop Now</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My <span className="gradient-text">Orders</span></h1>
                    <p className="page-subtitle">{orders.length} orders</p>
                </div>

                <div className="orders-list">
                    {orders.map(order => {
                        const currentStep = statusSteps.indexOf(order.status);
                        return (
                            <div key={order.id} className="order-card glass">
                                <div className="order-header">
                                    <div>
                                        <h3 className="order-id">Order #{order.id}</h3>
                                        <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="order-header-right">
                                        <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                                        <span className="order-total">${parseFloat(order.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                {order.status !== 'cancelled' && (
                                    <div className="order-timeline">
                                        {statusSteps.map((step, i) => (
                                            <div key={step} className={`timeline-step ${i <= currentStep ? 'completed' : ''} ${i === currentStep ? 'current' : ''}`}>
                                                <div className="timeline-dot" />
                                                <span className="timeline-label">{step}</span>
                                            </div>
                                        ))}
                                        <div className="timeline-line">
                                            <div className="timeline-progress" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                )}

                                <div className="order-items">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="order-item">
                                            <div className="order-item-img"><span>📦</span></div>
                                            <div className="order-item-info">
                                                <Link to={`/product/${item.product_id}`} className="order-item-name">{item.name}</Link>
                                                <p className="order-item-meta">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
