import { useState } from 'react';
import { FiUser, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        zip_code: user?.zip_code || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await authService.updateProfile(form);
            updateUser(res.data.user);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My <span className="gradient-text">Profile</span></h1>
                </div>
                <div className="profile-layout">
                    <div className="profile-sidebar glass">
                        <div className="profile-avatar">
                            <span>{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="profile-name">{user?.name}</h2>
                        <p className="profile-email">{user?.email}</p>
                        <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                            {user?.role}
                        </span>
                    </div>

                    <form className="profile-form glass" onSubmit={handleSubmit}>
                        <h2 className="profile-section-title"><FiUser /> Personal Information</h2>
                        <div className="profile-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input type="tel" className="form-input" value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-input" value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" className="form-input" value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input type="text" className="form-input" value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ZIP Code</label>
                                <input type="text" className="form-input" value={form.zip_code}
                                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
