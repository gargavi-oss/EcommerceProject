import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🛒</span>
                    <span className="brand-text gradient-text">ShopVerse</span>
                </Link>

                <form className="navbar-search" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </form>

                <div className="navbar-actions">
                    <Link to="/products" className="nav-link">Products</Link>

                    {user ? (
                        <>
                            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
                                <FiHeart />
                            </Link>
                            <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
                                <FiShoppingCart />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>

                            <div className="profile-dropdown">
                                <button className="nav-icon-btn profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                                    <FiUser />
                                </button>
                                {profileOpen && (
                                    <div className="dropdown-menu glass" onClick={() => setProfileOpen(false)}>
                                        <div className="dropdown-header">
                                            <p className="dropdown-name">{user.name}</p>
                                            <p className="dropdown-email">{user.email}</p>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link to="/profile" className="dropdown-item">
                                            <FiUser /> Profile
                                        </Link>
                                        <Link to="/orders" className="dropdown-item">
                                            <FiPackage /> My Orders
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" className="dropdown-item dropdown-admin">
                                                <FiGrid /> Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item dropdown-logout" onClick={logout}>
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}

                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="mobile-menu glass" onClick={() => setMenuOpen(false)}>
                    <Link to="/products" className="mobile-link">Products</Link>
                    {user ? (
                        <>
                            <Link to="/cart" className="mobile-link">Cart ({cartCount})</Link>
                            <Link to="/wishlist" className="mobile-link">Wishlist</Link>
                            <Link to="/orders" className="mobile-link">My Orders</Link>
                            <Link to="/profile" className="mobile-link">Profile</Link>
                            {isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}
                            <button className="mobile-link" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-link">Login</Link>
                            <Link to="/register" className="mobile-link">Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
