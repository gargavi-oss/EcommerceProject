const db = require('../config/db');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const [reviews] = await db.query(
            `SELECT r.*, u.name as user_name, u.avatar 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
            [req.params.productId]
        );

        const [stats] = await db.query(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as total,
       SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
       SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
       SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
       SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
       SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE product_id = ?`,
            [req.params.productId]
        );

        res.json({
            reviews,
            stats: {
                avg_rating: stats[0].avg_rating ? parseFloat(stats[0].avg_rating).toFixed(1) : 0,
                total: stats[0].total,
                distribution: {
                    5: stats[0].five_star || 0,
                    4: stats[0].four_star || 0,
                    3: stats[0].three_star || 0,
                    2: stats[0].two_star || 0,
                    1: stats[0].one_star || 0
                }
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create review
exports.createReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating) {
            return res.status(400).json({ message: 'Product ID and rating are required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Check if user already reviewed this product
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            // Update existing review
            await db.query(
                'UPDATE reviews SET rating = ?, comment = ? WHERE user_id = ? AND product_id = ?',
                [rating, comment || null, req.user.id, product_id]
            );
            res.json({ message: 'Review updated successfully' });
        } else {
            // Create new review
            await db.query(
                'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
                [req.user.id, product_id, rating, comment || null]
            );
            res.status(201).json({ message: 'Review created successfully' });
        }
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM reviews WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
