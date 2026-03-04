const db = require('../config/db');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products');
        const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await db.query('SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != "cancelled"');
        const [pendingOrders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const [recentOrders] = await db.query(
            `SELECT o.*, u.name as customer_name, u.email as customer_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC LIMIT 5`
        );
        const [unreadNotifications] = await db.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE');

        res.json({
            stats: {
                total_users: totalUsers[0].count,
                total_products: totalProducts[0].count,
                total_orders: totalOrders[0].count,
                total_revenue: parseFloat(totalRevenue[0].revenue).toFixed(2),
                pending_orders: pendingOrders[0].count,
                unread_notifications: unreadNotifications[0].count
            },
            recent_orders: recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
        );
        const [unreadCount] = await db.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE');

        res.json({ notifications, unread_count: unreadCount[0].count });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE');
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user role (admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user (admin)
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id == req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account.' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
