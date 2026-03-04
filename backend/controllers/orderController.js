const db = require('../config/db');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, notes } = req.body;

        if (!shipping_name || !shipping_email || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_zip) {
            return res.status(400).json({ message: 'All shipping fields are required.' });
        }

        // Get cart items
        const [cartItems] = await db.query(
            `SELECT ci.*, p.name, p.price, p.sale_price, p.stock, p.image 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty.' });
        }

        // Check stock for all items
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}.` });
            }
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => {
            const price = item.sale_price || item.price;
            return sum + (price * item.quantity);
        }, 0);

        // Create order
        const [orderResult] = await db.query(
            `INSERT INTO orders (user_id, total, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, total, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, notes || null]
        );

        const orderId = orderResult.insertId;

        // Create order items and update stock
        for (const item of cartItems) {
            const price = item.sale_price || item.price;
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, price]
            );
            await db.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart
        await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        // Create notification for admin
        const notificationTitle = `New Order #${orderId}`;
        const notificationMessage = JSON.stringify({
            order_id: orderId,
            customer_name: shipping_name,
            customer_email: shipping_email,
            customer_phone: shipping_phone,
            customer_address: `${shipping_address}, ${shipping_city}, ${shipping_state} ${shipping_zip}`,
            total: total.toFixed(2),
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: (item.sale_price || item.price).toFixed(2),
                image: item.image
            })),
            notes: notes || ''
        });

        await db.query(
            'INSERT INTO notifications (type, title, message, order_id) VALUES (?, ?, ?, ?)',
            ['new_order', notificationTitle, notificationMessage, orderId]
        );

        // Emit socket event for real-time notification
        if (req.io) {
            req.io.emit('new_order', {
                id: orderId,
                title: notificationTitle,
                customer_name: shipping_name,
                customer_email: shipping_email,
                customer_phone: shipping_phone,
                customer_address: `${shipping_address}, ${shipping_city}, ${shipping_state} ${shipping_zip}`,
                total: total.toFixed(2),
                items_count: cartItems.length,
                created_at: new Date().toISOString()
            });
        }

        // Get full order details
        const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const [orderItems] = await db.query(
            `SELECT oi.*, p.name, p.image FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
            [orderId]
        );

        res.status(201).json({
            message: 'Order placed successfully',
            order: { ...order[0], items: orderItems }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        // Get items for each order
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.image, p.slug FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image, p.slug FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.json({ ...orders[0], items });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id';
        const params = [];

        if (status) {
            query += ' WHERE o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [orders] = await db.query(query, params);

        // Get items for each order
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.image FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders');

        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

        const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Order status updated', order: order[0] });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
