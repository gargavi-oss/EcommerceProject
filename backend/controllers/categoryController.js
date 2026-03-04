const db = require('../config/db');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT c.*, COUNT(p.id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id 
       GROUP BY c.id 
       ORDER BY c.name ASC`
        );
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single category
exports.getCategory = async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE id = ? OR slug = ?',
            [req.params.id, req.params.id]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.json(categories[0]);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create category (admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const [result] = await db.query(
            'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
            [name, slug, description || null, image || null]
        );

        const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: 'Category created successfully', category: newCategory[0] });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

        await db.query(
            'UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?',
            [name, slug, description, image, req.params.id]
        );

        const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category updated successfully', category: updated[0] });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
