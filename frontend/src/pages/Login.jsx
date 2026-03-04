import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const user = await login(form);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome <span className="gradient-text">Back</span></h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" placeholder="your@email.com" required
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" placeholder="••••••••" required
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                </p>
                <div className="auth-demo">
                    <p>Demo Admin: <code>admin@store.com</code> / <code>admin123</code></p>
                </div>
            </div>
        </div>
    );
}
