const db = require('../config/db');

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT w.*, p.name, p.price, p.sale_price, p.image, p.stock, p.slug, p.description 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
            [req.user.id]
        );
        res.json(items);
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle wishlist item
exports.toggleWishlist = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        // Check if already in wishlist
        const [existing] = await db.query(
            'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            // Remove from wishlist
            await db.query(
                'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
                [req.user.id, product_id]
            );
            res.json({ message: 'Removed from wishlist', added: false });
        } else {
            // Add to wishlist
            await db.query(
                'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
                [req.user.id, product_id]
            );
            res.json({ message: 'Added to wishlist', added: true });
        }
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
    try {
        const [items] = await db.query(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]
        );
        res.json({ inWishlist: items.length > 0 });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
