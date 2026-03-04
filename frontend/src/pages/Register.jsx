import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        try {
            setLoading(true);
            await register(form);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1 className="auth-title">Create <span className="gradient-text">Account</span></h1>
                    <p className="auth-subtitle">Join ShopVerse today</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" placeholder="John Doe" required
                            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" placeholder="your@email.com" required
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone (optional)</label>
                        <input type="tel" className="form-input" placeholder="+1 (555) 123-4567"
                            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="Min 6 characters" required
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
