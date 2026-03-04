const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: result.insertId, name, email, role: 'user' }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, address, city, state, zip_code, role, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, city, state, zip_code } = req.body;

        await db.query(
            'UPDATE users SET name = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ? WHERE id = ?',
            [name, phone || null, address || null, city || null, state || null, zip_code || null, req.user.id]
        );

        const [users] = await db.query(
            'SELECT id, name, email, phone, address, city, state, zip_code, role, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
