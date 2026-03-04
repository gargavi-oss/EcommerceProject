import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

    const handleUpdateQty = async (id, qty) => {
        try {
            await updateQuantity(id, qty);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeFromCart(id);
            toast.success('Item removed');
        } catch (err) {
            toast.error('Failed to remove item');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3 className="empty-state-title">Your Cart is Empty</h3>
                        <p className="empty-state-text">Looks like you haven't added anything yet</p>
                        <Link to="/products" className="btn btn-primary">
                            <FiShoppingBag /> Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Shopping <span className="gradient-text">Cart</span></h1>
                    <p className="page-subtitle">{cartItems.length} items in your cart</p>
                </div>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item glass">
                                <div className="cart-item-image">
                                    <span>📦</span>
                                </div>
                                <div className="cart-item-info">
                                    <Link to={`/product/${item.product_id}`} className="cart-item-name">{item.name}</Link>
                                    <div className="cart-item-price">
                                        {item.sale_price ? (
                                            <>
                                                <span className="price price-sale">${parseFloat(item.sale_price).toFixed(2)}</span>
                                                <span className="price-original">${parseFloat(item.price).toFixed(2)}</span>
                                            </>
                                        ) : (
                                            <span className="price">${parseFloat(item.price).toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="cart-item-controls">
                                    <div className="quantity-control">
                                        <button className="qty-btn" onClick={() => handleUpdateQty(item.id, Math.max(1, item.quantity - 1))}><FiMinus /></button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}><FiPlus /></button>
                                    </div>
                                    <p className="cart-item-total">
                                        ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                                    </p>
                                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleRemove(item.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-outline btn-sm" onClick={clearCart}>Clear Cart</button>
                    </div>

                    <div className="cart-summary glass">
                        <h3 className="summary-title">Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-shipping">{cartTotal >= 50 ? 'FREE' : '$5.99'}</span>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>${(cartTotal + (cartTotal >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="btn btn-primary btn-lg cart-checkout-btn">
                            Proceed to Checkout <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
