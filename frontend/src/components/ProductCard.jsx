import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to add items to cart');
            return;
        }
        try {
            await addToCart(product.id);
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to use wishlist');
            return;
        }
        try {
            const res = await toggleWishlist(product.id);
            toast.success(res.added ? 'Added to wishlist!' : 'Removed from wishlist');
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    return (
        <Link to={`/product/${product.id}`} className="product-card card">
            <div className="product-image-wrapper">
                <div className="product-image-placeholder">
                    <span className="product-emoji">📦</span>
                </div>
                {discount > 0 && (
                    <span className="product-discount-badge">-{discount}%</span>
                )}
                <div className="product-actions-overlay">
                    <button className={`product-action-btn ${inWishlist ? 'wishlisted' : ''}`} onClick={handleToggleWishlist}>
                        {inWishlist ? <FaHeart /> : <FiHeart />}
                    </button>
                    <button className="product-action-btn" onClick={handleAddToCart}>
                        <FiShoppingCart />
                    </button>
                </div>
            </div>
            <div className="product-info">
                <p className="product-category">{product.category_name || 'General'}</p>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.round(product.avg_rating || 0) ? 'star-filled' : 'star-empty-icon'} />
                    ))}
                    <span className="rating-count">({product.total_reviews || 0})</span>
                </div>
                <div className="product-price-row">
                    {product.sale_price ? (
                        <>
                            <span className="price price-sale">${parseFloat(product.sale_price).toFixed(2)}</span>
                            <span className="price-original">${parseFloat(product.price).toFixed(2)}</span>
                        </>
                    ) : (
                        <span className="price">${parseFloat(product.price).toFixed(2)}</span>
                    )}
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                    <p className="product-stock-warning">Only {product.stock} left!</p>
                )}
                {product.stock === 0 && (
                    <p className="product-out-of-stock">Out of Stock</p>
                )}
            </div>
        </Link>
    );
}
