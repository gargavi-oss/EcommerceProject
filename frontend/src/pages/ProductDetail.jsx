import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiChevronLeft } from 'react-icons/fi';
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { productService, reviewService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const API_BASE = 'http://localhost:8000';

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState({ reviews: [], stats: {} });
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const [productRes, reviewsRes] = await Promise.all([
                productService.getOne(id),
                reviewService.getByProduct(id)
            ]);
            setProduct(productRes.data);
            setReviews(reviewsRes.data);
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) return toast.error('Please login first');
        try {
            await addToCart(product.id, quantity);
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const handleToggleWishlist = async () => {
        if (!user) return toast.error('Please login first');
        try {
            const res = await toggleWishlist(product.id);
            toast.success(res.added ? 'Added to wishlist!' : 'Removed from wishlist');
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login first');
        try {
            setSubmitting(true);
            await reviewService.create({ product_id: product.id, ...reviewForm });
            toast.success('Review submitted!');
            setReviewForm({ rating: 5, comment: '' });
            const reviewsRes = await reviewService.getByProduct(id);
            setReviews(reviewsRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) stars.push(<FaStar key={i} />);
            else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} />);
            else stars.push(<FaRegStar key={i} />);
        }
        return stars;
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;
    if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

    const discount = product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;
    const inWishlist = isInWishlist(product.id);

    return (
        <div className="page">
            <div className="container">
                <Link to="/products" className="back-link"><FiChevronLeft /> Back to Products</Link>

                <div className="product-detail">
                    <div className="product-detail-image">
                        {product.image ? (
                            <img src={`${API_BASE}${product.image}`} alt={product.name} className="product-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        ) : (
                            <div className="detail-image-placeholder">
                                <span className="detail-emoji">📦</span>
                            </div>
                        )}
                        {discount > 0 && <span className="detail-discount-badge">-{discount}%</span>}
                    </div>

                    <div className="product-detail-info">
                        <p className="detail-category">{product.category_name || 'General'}</p>
                        <h1 className="detail-name">{product.name}</h1>

                        <div className="detail-rating">
                            <div className="stars">{renderStars(parseFloat(product.avg_rating || 0))}</div>
                            <span className="detail-rating-text">
                                {product.avg_rating || '0'} ({product.total_reviews} reviews)
                            </span>
                        </div>

                        <div className="detail-price">
                            {product.sale_price ? (
                                <>
                                    <span className="price price-sale">{formatPrice(product.sale_price)}</span>
                                    <span className="price-original">{formatPrice(product.price)}</span>
                                    <span className="badge badge-danger">Save {discount}%</span>
                                </>
                            ) : (
                                <span className="price">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <p className="detail-description">{product.description}</p>

                        <div className="detail-stock">
                            {product.stock > 0 ? (
                                <span className="badge badge-success">✓ In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="badge badge-danger">✗ Out of Stock</span>
                            )}
                        </div>

                        {product.stock > 0 && (
                            <div className="detail-actions">
                                <div className="quantity-control">
                                    <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button>
                                    <span className="qty-value">{quantity}</span>
                                    <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><FiPlus /></button>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    <FiShoppingCart /> Add to Cart
                                </button>
                                <button className={`btn btn-icon btn-secondary ${inWishlist ? 'wishlisted' : ''}`} onClick={handleToggleWishlist}>
                                    {inWishlist ? <FaHeart style={{ color: 'var(--accent)' }} /> : <FiHeart />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <h2 className="section-title">Customer Reviews</h2>

                    {reviews.stats.total > 0 && (
                        <div className="reviews-summary glass">
                            <div className="reviews-avg">
                                <span className="reviews-avg-number">{reviews.stats.avg_rating}</span>
                                <div className="stars">{renderStars(parseFloat(reviews.stats.avg_rating))}</div>
                                <span className="reviews-avg-count">{reviews.stats.total} reviews</span>
                            </div>
                            <div className="reviews-bars">
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div className="review-bar-row" key={star}>
                                        <span className="bar-label">{star} ★</span>
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{ width: `${reviews.stats.total ? (reviews.stats.distribution[star] / reviews.stats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="bar-count">{reviews.stats.distribution[star]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {user && (
                        <form className="review-form glass" onSubmit={handleSubmitReview}>
                            <h3>Write a Review</h3>
                            <div className="review-stars-input">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" className="star-input-btn" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                        {star <= reviewForm.rating ? <FaStar className="star-filled" /> : <FaRegStar />}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="form-input"
                                placeholder="Share your experience..."
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                rows="3"
                            />
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {reviews.reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.reviews.map(review => (
                                <div key={review.id} className="review-item glass">
                                    <div className="review-header">
                                        <div className="review-user">
                                            <div className="review-avatar">{review.user_name?.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p className="review-username">{review.user_name}</p>
                                                <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="stars">{renderStars(review.rating)}</div>
                                    </div>
                                    {review.comment && <p className="review-comment">{review.comment}</p>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
