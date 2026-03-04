import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { orderService } from '../api/services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
    const { cartItems, cartTotal, loadCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        shipping_name: user?.name || '',
        shipping_email: user?.email || '',
        shipping_phone: user?.phone || '',
        shipping_address: user?.address || '',
        shipping_city: user?.city || '',
        shipping_state: user?.state || '',
        shipping_zip: user?.zip_code || '',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await orderService.create(form);
            await loadCart();
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const shipping = cartTotal >= 50 ? 0 : 5.99;
    const total = cartTotal + shipping;

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Checkout</h1>
                </div>
                <form className="checkout-layout" onSubmit={handleSubmit}>
                    <div className="checkout-form glass">
                        <h2 className="checkout-section-title">Shipping Information</h2>
                        <div className="checkout-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input type="text" className="form-input" required value={form.shipping_name}
                                    onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" required value={form.shipping_email}
                                    onChange={(e) => setForm({ ...form, shipping_email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input type="tel" className="form-input" required value={form.shipping_phone}
                                    onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Address *</label>
                                <input type="text" className="form-input" required value={form.shipping_address}
                                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City *</label>
                                <input type="text" className="form-input" required value={form.shipping_city}
                                    onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State *</label>
                                <input type="text" className="form-input" required value={form.shipping_state}
                                    onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ZIP Code *</label>
                                <input type="text" className="form-input" required value={form.shipping_zip}
                                    onChange={(e) => setForm({ ...form, shipping_zip: e.target.value })} />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Order Notes (optional)</label>
                                <textarea className="form-input" rows="3" value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." />
                            </div>
                        </div>
                    </div>

                    <div className="checkout-summary glass">
                        <h2 className="checkout-section-title">Order Summary</h2>
                        <div className="checkout-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="checkout-item">
                                    <span className="checkout-item-name">{item.name} × {item.quantity}</span>
                                    <span className="checkout-item-price">
                                        ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary btn-lg cart-checkout-btn" type="submit" disabled={loading}>
                            <FiCheck /> {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
