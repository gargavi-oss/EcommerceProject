const db = require('../config/db');

// Get cart items
exports.getCart = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT ci.*, p.name, p.price, p.sale_price, p.image, p.stock, p.slug 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
            [req.user.id]
        );

        const total = items.reduce((sum, item) => {
            const price = item.sale_price || item.price;
            return sum + (price * item.quantity);
        }, 0);

        res.json({ items, total: parseFloat(total.toFixed(2)), count: items.length });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        // Check if product exists and has stock
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (products[0].stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }

        // Check if already in cart
        const [existing] = await db.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, req.user.id, product_id]
            );
        } else {
            await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, product_id, quantity]
            );
        }

        // Return updated cart
        const [items] = await db.query(
            `SELECT ci.*, p.name, p.price, p.sale_price, p.image, p.stock 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
            [req.user.id]
        );

        res.json({ message: 'Added to cart', items, count: items.length });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1.' });
        }

        // Check stock
        const [items] = await db.query(
            `SELECT ci.*, p.stock FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = ? AND ci.user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (items.length === 0) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }

        if (items[0].stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }

        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        res.json({ message: 'Cart updated' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
