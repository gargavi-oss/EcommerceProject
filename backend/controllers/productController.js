const db = require('../config/db');

// Get all products (with filters, search, pagination)
exports.getProducts = async (req, res) => {
    try {
        const { category, search, min_price, max_price, sort, page = 1, limit = 12, featured } = req.query;
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
        const params = [];
        const countParams = [];

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND p.category_id = (SELECT id FROM categories WHERE slug = ?)';
            params.push(category);
            countParams.push(category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm);
        }

        if (min_price) {
            query += ' AND p.price >= ?';
            countQuery += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
            countParams.push(parseFloat(min_price));
        }

        if (max_price) {
            query += ' AND p.price <= ?';
            countQuery += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
            countParams.push(parseFloat(max_price));
        }

        if (featured === 'true') {
            query += ' AND p.featured = TRUE';
            countQuery += ' AND p.featured = TRUE';
        }

        // Sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            case 'name_asc':
                query += ' ORDER BY p.name ASC';
                break;
            default:
                query += ' ORDER BY p.created_at DESC';
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);
        const [totalResult] = await db.query(countQuery, countParams);
        const total = totalResult[0].total;

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? OR p.slug = ?`,
            [req.params.id, req.params.id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Get average rating
        const [ratings] = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?',
            [products[0].id]
        );

        const product = {
            ...products[0],
            avg_rating: ratings[0].avg_rating ? parseFloat(ratings[0].avg_rating).toFixed(1) : null,
            total_reviews: ratings[0].total_reviews
        };

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, sale_price, stock, category_id, image, featured } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required.' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const [result] = await db.query(
            `INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, image, featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, slug, description || null, price, sale_price || null, stock || 0, category_id || null, image || null, featured || false]
        );

        const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: 'Product created successfully', product: newProduct[0] });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, sale_price, stock, category_id, image, featured } = req.body;
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

        await db.query(
            `UPDATE products SET name = ?, slug = ?, description = ?, price = ?, sale_price = ?, 
       stock = ?, category_id = ?, image = ?, featured = ? WHERE id = ?`,
            [name, slug, description, price, sale_price || null, stock, category_id || null, image || null, featured || false, req.params.id]
        );

        const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product updated successfully', product: updated[0] });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
