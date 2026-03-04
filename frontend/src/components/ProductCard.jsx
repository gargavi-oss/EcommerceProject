import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import './ProductCard.css';

const API_BASE = 'http://localhost:8000';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate('/login');
        try {
            await addToCart(product.id);
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return navigate('/login');
        try {
            await toggleWishlist(product.id);
            toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
        } catch (err) {
            toast.error('Failed');
        }
    };

    const discount = product.sale_price ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

    const imageUrl = product.image ? `${API_BASE}${product.image}` : null;

    return (
        <Link to={`/product/${product.id}`} className="product-card card">
            <div className="product-card-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="product-img" />
                ) : (
                    <div className="product-card-placeholder">📦</div>
                )}
                {discount > 0 && <span className="discount-badge">{discount}% off</span>}
                <div className="product-card-actions">
                    <button className={`product-action-btn ${inWishlist ? 'active' : ''}`} onClick={handleWishlist}>
                        <FiHeart fill={inWishlist ? '#E63946' : 'none'} />
                    </button>
                    <button className="product-action-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                        <FiShoppingCart />
                    </button>
                </div>
            </div>
            <div className="card-body">
                <p className="product-card-category">{product.category_name}</p>
                <h3 className="product-card-name">{product.name}</h3>
                <div className="product-card-rating">
                    {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={s <= Math.round(product.avg_rating || 0) ? 'star' : 'star star-empty'}>★</span>
                    ))}
                    <span className="rating-count">({product.review_count || 0})</span>
                </div>
                <div className="product-card-price">
                    {product.sale_price ? (
                        <>
                            <span className="price price-sale">{formatPrice(product.sale_price)}</span>
                            <span className="price-original">{formatPrice(product.price)}</span>
                        </>
                    ) : (
                        <span className="price">{formatPrice(product.price)}</span>
                    )}
                </div>
                {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
            </div>
        </Link>
    );
}
