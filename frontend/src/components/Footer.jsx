import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-brand">
                            <span>🛒</span> <span className="gradient-text">ShopVerse</span>
                        </h3>
                        <p className="footer-desc">Your one-stop shop for everything you need. Quality products, fast delivery, and amazing prices.</p>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Quick Links</h4>
                        <Link to="/products" className="footer-link">All Products</Link>
                        <Link to="/products?featured=true" className="footer-link">Featured</Link>
                        <Link to="/cart" className="footer-link">Shopping Cart</Link>
                        <Link to="/orders" className="footer-link">Track Orders</Link>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Categories</h4>
                        <Link to="/products?category=electronics" className="footer-link">Electronics</Link>
                        <Link to="/products?category=clothing" className="footer-link">Clothing</Link>
                        <Link to="/products?category=home-kitchen" className="footer-link">Home & Kitchen</Link>
                        <Link to="/products?category=books" className="footer-link">Books</Link>
                    </div>
                    <div className="footer-col">
                        <h4 className="footer-title">Contact</h4>
                        <p className="footer-contact"><FiMail /> support@shopverse.com</p>
                        <p className="footer-contact"><FiPhone /> +1 (555) 123-4567</p>
                        <p className="footer-contact"><FiMapPin /> 123 Commerce St, NY</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
