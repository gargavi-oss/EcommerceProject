import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { productService, categoryService } from '../api/services';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productService.getAll({ featured: 'true', limit: 8 }),
                categoryService.getAll()
            ]);
            setFeatured(productsRes.data.products);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Failed to load home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryEmojis = {
        'electronics': '💻',
        'clothing': '👕',
        'home-kitchen': '🏠',
        'books': '📚',
        'sports-outdoors': '⚽',
        'beauty-health': '💄'
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">✨ New Season Arrivals</div>
                        <h1 className="hero-title">
                            Discover Premium<br />
                            <span className="gradient-text">Shopping Experience</span>
                        </h1>
                        <p className="hero-subtitle">
                            Explore thousands of products from top brands with fast delivery and amazing prices.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/products?featured=true" className="btn btn-secondary btn-lg">
                                Featured Items
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">10K+</span>
                                <span className="stat-label">Products</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Happy Customers</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-number">99%</span>
                                <span className="stat-label">Satisfaction</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-bg-glow" />
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card glass">
                            <div className="feature-icon"><FiTruck /></div>
                            <h3>Free Shipping</h3>
                            <p>On orders over $50</p>
                        </div>
                        <div className="feature-card glass">
                            <div className="feature-icon"><FiShield /></div>
                            <h3>Secure Payment</h3>
                            <p>100% secure checkout</p>
                        </div>
                        <div className="feature-card glass">
                            <div className="feature-icon"><FiRefreshCw /></div>
                            <h3>Easy Returns</h3>
                            <p>30-day return policy</p>
                        </div>
                        <div className="feature-card glass">
                            <div className="feature-icon"><FiHeadphones /></div>
                            <h3>24/7 Support</h3>
                            <p>Dedicated customer service</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Shop by <span className="gradient-text">Category</span></h2>
                        <Link to="/products" className="section-link">View All <FiArrowRight /></Link>
                    </div>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card glass">
                                <span className="category-emoji">{categoryEmojis[cat.slug] || '📦'}</span>
                                <h3 className="category-name">{cat.name}</h3>
                                <p className="category-count">{cat.product_count} products</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured <span className="gradient-text">Products</span></h2>
                        <Link to="/products?featured=true" className="section-link">View All <FiArrowRight /></Link>
                    </div>
                    {loading ? (
                        <div className="loading-container"><div className="spinner" /></div>
                    ) : (
                        <div className="grid grid-4">
                            {featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <h2 className="cta-title">Ready to Start Shopping?</h2>
                        <p className="cta-text">Join thousands of satisfied customers and discover the best deals today.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Account <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
