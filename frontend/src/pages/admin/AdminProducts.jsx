import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiShoppingBag, FiPackage, FiUsers, FiTrendingUp, FiX } from 'react-icons/fi';
import { productService, categoryService } from '../../api/services';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', sale_price: '', stock: '', category_id: '', featured: false });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                productService.getAll({ limit: 100 }),
                categoryService.getAll()
            ]);
            setProducts(prodRes.data.products);
            setCategories(catRes.data);
        } catch (error) {
            console.error('Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: '', sale_price: '', stock: '', category_id: '', featured: false });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            sale_price: product.sale_price || '',
            stock: product.stock,
            category_id: product.category_id || '',
            featured: product.featured
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await productService.update(editing.id, form);
                toast.success('Product updated!');
            } else {
                await productService.create(form);
                toast.success('Product created!');
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await productService.delete(id);
            toast.success('Product deleted');
            loadData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="admin-page">
            <div className="admin-sidebar glass">
                <div className="admin-sidebar-brand"><span>🛒</span> <span className="gradient-text">Admin</span></div>
                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item"><FiTrendingUp /> Dashboard</Link>
                    <Link to="/admin/products" className="admin-nav-item active"><FiShoppingBag /> Products</Link>
                    <Link to="/admin/orders" className="admin-nav-item"><FiPackage /> Orders</Link>
                    <Link to="/admin/users" className="admin-nav-item"><FiUsers /> Users</Link>
                </nav>
                <Link to="/" className="admin-nav-item admin-back-link">← Back to Store</Link>
            </div>

            <div className="admin-main">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">Products</h1>
                    <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>{p.category_name || '—'}</td>
                                    <td>
                                        {p.sale_price ? (
                                            <><span className="price price-sale">${parseFloat(p.sale_price).toFixed(2)}</span> <span className="price-original">${parseFloat(p.price).toFixed(2)}</span></>
                                        ) : (
                                            <span className="price">${parseFloat(p.price).toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td><span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stock}</span></td>
                                    <td>{p.featured ? '⭐' : '—'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(p)}><FiEdit2 /></button>
                                            <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="admin-modal glass" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
                                <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input type="text" className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price *</label>
                                        <input type="number" step="0.01" className="form-input" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sale Price</label>
                                        <input type="number" step="0.01" className="form-input" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Stock *</label>
                                        <input type="number" className="form-input" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                                            <option value="">None</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                                        <span className="form-label" style={{ margin: 0 }}>Featured Product</span>
                                    </label>
                                </div>
                                <div className="admin-modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
