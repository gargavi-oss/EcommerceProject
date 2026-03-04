import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import './Wishlist.css';

const API_BASE = 'http://localhost:8000';

export default function Wishlist() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = async (item) => {
        try {
            await addToCart(item.product_id);
            await removeFromWishlist(item.id);
            toast.success('Moved to cart!');
        } catch (err) {
            toast.error('Failed to move to cart');
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeFromWishlist(id);
            toast.success('Removed from wishlist');
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">💝</div>
                        <h3 className="empty-state-title">Your Wishlist is Empty</h3>
                        <p className="empty-state-text">Save items you love for later!</p>
                        <Link to="/products" className="btn btn-primary"><FiHeart /> Browse Products</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My <span className="gradient-text">Wishlist</span></h1>
                    <p className="page-subtitle">{wishlistItems.length} items saved</p>
                </div>
                <div className="grid grid-4">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="wishlist-card card">
                            <div className="wishlist-image">
                                {item.image ? (
                                    <img src={`${API_BASE}${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div className="card-body">
                                <Link to={`/product/${item.product_id}`} className="wishlist-name">{item.name}</Link>
                                <div className="wishlist-price">
                                    {item.sale_price ? (
                                        <>
                                            <span className="price price-sale">{formatPrice(item.sale_price)}</span>
                                            <span className="price-original">{formatPrice(item.price)}</span>
                                        </>
                                    ) : (
                                        <span className="price">{formatPrice(item.price)}</span>
                                    )}
                                </div>
                                <div className="wishlist-actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMoveToCart(item)}>
                                        <FiShoppingCart /> Add to Cart
                                    </button>
                                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleRemove(item.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
