import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { productService, categoryService } from '../api/services';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') || '';
    const page = searchParams.get('page') || '1';

    useEffect(() => {
        loadProducts();
    }, [category, search, sort, featured, page]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 12, sort };
            if (category) params.category = category;
            if (search) params.search = search;
            if (featured) params.featured = featured;

            const res = await productService.getAll(params);
            setProducts(res.data.products);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await categoryService.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const hasFilters = category || search || featured;

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">
                        {search ? `Search: "${search}"` : featured ? 'Featured Products' : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
                    </h1>
                    <p className="page-subtitle">{pagination.total || 0} products found</p>
                </div>

                <div className="products-layout">
                    {/* Sidebar Filters */}
                    <aside className={`filters-sidebar glass ${filtersOpen ? 'open' : ''}`}>
                        <div className="filters-header">
                            <h3>Filters</h3>
                            <button className="filters-close" onClick={() => setFiltersOpen(false)}><FiX /></button>
                        </div>

                        {hasFilters && (
                            <button className="btn btn-outline btn-sm clear-filters-btn" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        )}

                        <div className="filter-group">
                            <h4 className="filter-title">Categories</h4>
                            <button
                                className={`filter-option ${!category ? 'active' : ''}`}
                                onClick={() => updateFilter('category', '')}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`filter-option ${category === cat.slug ? 'active' : ''}`}
                                    onClick={() => updateFilter('category', cat.slug)}
                                >
                                    {cat.name}
                                    <span className="filter-count">{cat.product_count}</span>
                                </button>
                            ))}
                        </div>

                        <div className="filter-group">
                            <h4 className="filter-title">Sort By</h4>
                            <select className="form-input" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A-Z</option>
                            </select>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="products-main">
                        <div className="products-toolbar">
                            <button className="btn btn-secondary btn-sm mobile-filter-btn" onClick={() => setFiltersOpen(true)}>
                                <FiFilter /> Filters
                            </button>
                            <div className="products-sort-desktop">
                                <select className="form-input" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="name_asc">Name: A-Z</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-container"><div className="spinner" /></div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <h3 className="empty-state-title">No products found</h3>
                                <p className="empty-state-text">Try adjusting your filters or search terms</p>
                                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-3">
                                    {products.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {pagination.pages > 1 && (
                                    <div className="pagination">
                                        {Array.from({ length: pagination.pages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                className={`pagination-btn ${parseInt(page) === i + 1 ? 'active' : ''}`}
                                                onClick={() => updateFilter('page', String(i + 1))}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
