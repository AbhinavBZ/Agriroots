const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'agriroots_super_secret_key_2025';

app.use(cors());
app.use(express.json());

// ─── Database Connection Pool ──────────────────────────────────────────────────
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agriroots',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ─── JWT Middleware ────────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// ─── Initialize All Database Tables ───────────────────────────────────────────
async function initDB() {
    try {
        const connection = await pool.getConnection();

        // 1. Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phoneNumber VARCHAR(50),
                farmState VARCHAR(100),
                landArea VARCHAR(50),
                soilType VARCHAR(100),
                currentCrop VARCHAR(100),
                location VARCHAR(255),
                membershipType VARCHAR(50) DEFAULT 'Standard',
                profileImage VARCHAR(500) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Services Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                \`desc\` TEXT NOT NULL,
                btn VARCHAR(255) NOT NULL,
                color VARCHAR(50),
                path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 3. Shop Items Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS shop_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price VARCHAR(50) NOT NULL,
                tag VARCHAR(100) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Cart Table (per user)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                shop_item_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (shop_item_id) REFERENCES shop_items(id) ON DELETE CASCADE,
                UNIQUE KEY unique_cart_item (user_id, shop_item_id)
            )
        `);

        // 5. Orders Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                totalAmount DECIMAL(10, 2) NOT NULL,
                shippingAddress TEXT NOT NULL,
                status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 6. Order Items Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                shop_item_id INT,
                name VARCHAR(255) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `);

        // 7. Crops Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS crops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                season VARCHAR(100) NOT NULL,
                cycle VARCHAR(100) NOT NULL,
                climate TEXT NOT NULL,
                soil TEXT NOT NULL,
                profitability VARCHAR(100) NOT NULL,
                profitDesc TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Crop Diseases Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS crop_diseases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                crop_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                remedy TEXT NOT NULL,
                FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
            )
        `);

        // 9. Seasonal Patterns Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS seasonal_patterns (
                id INT AUTO_INCREMENT PRIMARY KEY,
                season VARCHAR(100) NOT NULL,
                weather VARCHAR(255) NOT NULL,
                crops TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 10. Agriculture Data Tables (tabs: crops_guide, tools, products, policies, loans)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS agri_crops_guide (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(10) NOT NULL,
                season VARCHAR(100) NOT NULL,
                duration VARCHAR(100) NOT NULL,
                yield_per_acre VARCHAR(100) NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS agri_tools (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                \`use\` TEXT NOT NULL,
                price_range VARCHAR(100) NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS agri_products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                type VARCHAR(100) NOT NULL,
                dosage VARCHAR(255) NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS agri_policies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                details TEXT NOT NULL,
                eligibility TEXT NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS agri_loans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                issuer VARCHAR(255) NOT NULL,
                interest VARCHAR(100) NOT NULL,
                amount VARCHAR(100) NOT NULL
            )
        `);

        // 11. Loan Applications Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS loan_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                loan_id INT NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (loan_id) REFERENCES agri_loans(id) ON DELETE CASCADE
            )
        `);

        // 12. Insurance Applications Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS insurance_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                farm_address TEXT NOT NULL,
                status ENUM('Pending', 'Processing', 'Approved', 'Rejected') DEFAULT 'Pending',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 13. Market Prices Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS market_prices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                commodity VARCHAR(255) NOT NULL,
                mandi VARCHAR(255) NOT NULL,
                price_per_quintal VARCHAR(100) NOT NULL,
                change_percent VARCHAR(50) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 14. MSP Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS msp_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                crop VARCHAR(255) NOT NULL,
                season VARCHAR(100) NOT NULL,
                msp_2024 VARCHAR(100) NOT NULL,
                msp_2025 VARCHAR(100) NOT NULL,
                change_percent VARCHAR(50) NOT NULL
            )
        `);

        // 15. Feedback / Community Comments Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                parent_id INT DEFAULT NULL,
                category ENUM('General','Crop Help','Market','Weather','Suggestion','Bug') DEFAULT 'General',
                rating TINYINT DEFAULT NULL,
                message TEXT NOT NULL,
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES feedback(id) ON DELETE CASCADE
            )
        `);

        connection.release();
        console.log('✅ MySQL connected — all 15 tables initialized successfully!');
    } catch (error) {
        console.error('❌ MySQL Init Error:', error.message);
    }
}
initDB();

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, farmState } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Full name, email, and password are required.' });
        }
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            'INSERT INTO users (fullName, email, password, phoneNumber, farmState) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, hashedPassword, phoneNumber || null, farmState || null]
        );
        const token = jwt.sign({ id: result.insertId, email, fullName }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: { id: result.insertId, fullName, email, phoneNumber, farmState, membershipType: 'Standard' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: 'Login successful!', token, user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/me  (verify token & get profile)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, fullName, email, phoneNumber, farmState, landArea, soilType, currentCrop, location, membershipType, profileImage, created_at FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/auth/profile  (update profile)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, phoneNumber, farmState, landArea, soilType, currentCrop, location } = req.body;
        await pool.query(
            'UPDATE users SET fullName=?, phoneNumber=?, farmState=?, landArea=?, soilType=?, currentCrop=?, location=? WHERE id=?',
            [fullName, phoneNumber, farmState, landArea, soilType, currentCrop, location, req.user.id]
        );
        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile.' });
    }
});

// PUT /api/auth/change-password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
        const hashed = await bcrypt.hash(newPassword, 12);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
        res.json({ message: 'Password changed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM services');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching services.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHOP ITEMS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/shop-items', async (req, res) => {
    try {
        const { tag } = req.query;
        let query = 'SELECT * FROM shop_items';
        const params = [];
        if (tag && tag !== 'All') {
            query += ' WHERE tag = ?';
            params.push(tag);
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CART ROUTES (Protected)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cart  — get logged-in user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id, c.quantity, s.id as shop_item_id, s.name, s.price, s.tag, s.icon
            FROM cart c
            JOIN shop_items s ON c.shop_item_id = s.id
            WHERE c.user_id = ?
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/cart  — add item to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { shop_item_id, quantity = 1 } = req.body;
        await pool.query(
            'INSERT INTO cart (user_id, shop_item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
            [req.user.id, shop_item_id, quantity, quantity]
        );
        res.status(201).json({ message: 'Item added to cart!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/cart/:id  — update quantity
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
            return res.json({ message: 'Item removed from cart.' });
        }
        await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
        res.json({ message: 'Cart updated!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/cart/:id  — remove item
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Item removed from cart.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/cart  — clear entire cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS ROUTES (Protected)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/orders  — get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [req.user.id]);
        const result = orders.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.id)
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders  — place an order from cart
app.post('/api/orders', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { shippingAddress } = req.body;
        if (!shippingAddress) return res.status(400).json({ message: 'Shipping address is required.' });

        // Get cart items
        const [cartItems] = await connection.query(`
            SELECT c.quantity, s.id as shop_item_id, s.name, s.price
            FROM cart c JOIN shop_items s ON c.shop_item_id = s.id
            WHERE c.user_id = ?
        `, [req.user.id]);

        if (cartItems.length === 0) return res.status(400).json({ message: 'Your cart is empty.' });

        // Calculate total (parse price removing ₹ and commas)
        const totalAmount = cartItems.reduce((sum, item) => {
            const numericPrice = parseFloat(item.price.replace(/[₹,]/g, '').split(' ')[0]) || 0;
            return sum + (numericPrice * item.quantity);
        }, 0);

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, totalAmount, shippingAddress) VALUES (?, ?, ?)',
            [req.user.id, totalAmount, shippingAddress]
        );
        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of cartItems) {
            const numericPrice = parseFloat(item.price.replace(/[₹,]/g, '').split(' ')[0]) || 0;
            await connection.query(
                'INSERT INTO order_items (order_id, shop_item_id, name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.shop_item_id, item.name, item.quantity, numericPrice]
            );
        }

        // Clear cart
        await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully!', orderId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CROP GUIDE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/crops', async (req, res) => {
    try {
        const [crops] = await pool.query('SELECT * FROM crops');
        const [diseases] = await pool.query('SELECT * FROM crop_diseases');
        const cropData = crops.map(crop => ({
            ...crop,
            diseases: diseases.filter(d => d.crop_id === crop.id).map(d => ({ name: d.name, remedy: d.remedy }))
        }));
        res.json(cropData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/seasonal-patterns', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM seasonal_patterns');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGRICULTURE DATA TAB ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/agri/crops-guide', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agri_crops_guide');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agri/tools', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agri_tools');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agri/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agri_products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agri/policies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agri_policies');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/agri/loans', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agri_loans');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOAN APPLICATIONS (Protected)
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/loan-applications', authenticateToken, async (req, res) => {
    try {
        const { loan_id } = req.body;
        // Check if already applied
        const [existing] = await pool.query(
            'SELECT id FROM loan_applications WHERE user_id = ? AND loan_id = ?',
            [req.user.id, loan_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'You have already applied for this loan.' });
        }
        await pool.query(
            'INSERT INTO loan_applications (user_id, loan_id) VALUES (?, ?)',
            [req.user.id, loan_id]
        );
        res.status(201).json({ message: 'Loan application submitted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/loan-applications', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT la.id, la.status, la.applied_at, al.name, al.issuer, al.interest, al.amount
            FROM loan_applications la
            JOIN agri_loans al ON la.loan_id = al.id
            WHERE la.user_id = ?
            ORDER BY la.applied_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSURANCE APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/insurance', async (req, res) => {
    try {
        const { full_name, phone, farm_address, user_id } = req.body;
        if (!full_name || !phone || !farm_address) {
            return res.status(400).json({ message: 'Name, phone, and farm address are required.' });
        }
        await pool.query(
            'INSERT INTO insurance_applications (user_id, full_name, phone, farm_address) VALUES (?, ?, ?, ?)',
            [user_id || null, full_name, phone, farm_address]
        );
        res.status(201).json({ message: 'Insurance application submitted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET PRICES & MSP  — Live via data.gov.in AGMARKNET API
// ═══════════════════════════════════════════════════════════════════════════════

// In-memory cache — refreshed every 30 minutes
let marketCache = { data: null, fetchedAt: null, source: 'fallback' };
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Helper: promisified HTTPS GET
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            if (resp.statusCode !== 200) {
                reject(new Error(`HTTP ${resp.statusCode}`));
                resp.resume();
                return;
            }
            let raw = '';
            resp.on('data', chunk => raw += chunk);
            resp.on('end', () => {
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error('JSON parse error')); }
            });
        }).on('error', reject);
    });
}

// Helper: get today's date as dd/mm/yyyy (AGMARKNET format)
function getTodayDDMMYYYY() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Helper: compute price change % by comparing with yesterday's DB record
async function getChangePercent(commodity, modalPrice) {
    try {
        const [rows] = await pool.query(
            'SELECT price_per_quintal FROM market_prices WHERE commodity = ? ORDER BY updated_at ASC LIMIT 1',
            [commodity]
        );
        if (rows.length === 0) return 'N/A';
        const oldPriceStr = rows[0].price_per_quintal;
        const oldPrice = parseFloat(oldPriceStr.replace(/[^0-9.]/g, ''));
        if (!oldPrice || !modalPrice) return 'N/A';
        const change = (((modalPrice - oldPrice) / oldPrice) * 100).toFixed(1);
        return change >= 0 ? `+${change}%` : `${change}%`;
    } catch {
        return 'N/A';
    }
}

// Fetch live prices from data.gov.in and update DB
async function fetchLiveMarketPrices() {
    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) throw new Error('DATAGOV_API_KEY not set');

    const today = getTodayDDMMYYYY();
    // Try today first; if no data found, fallback to no date filter (latest available)
    const urls = [
        `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50&filters%5Barrival_date%5D=${encodeURIComponent(today)}`,
        `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50`
    ];

    let records = [];
    for (const url of urls) {
        const json = await httpsGet(url);
        if (json && json.records && json.records.length > 0) {
            records = json.records;
            break;
        }
    }

    if (records.length === 0) throw new Error('No records returned from AGMARKNET API');

    // Map API fields → our shape
    const mapped = await Promise.all(records.map(async (r) => {
        const commodity = r.commodity || r.Commodity || 'Unknown';
        const market = r.market || r.Market || r.district || 'Unknown';
        const state = r.state || r.State || '';
        const modalPrice = parseFloat(r.modal_price || r['Modal Price (Rs./Qtl.)'] || 0);
        const priceStr = modalPrice ? `₹${modalPrice.toLocaleString('en-IN')}/Qtl` : 'N/A';
        const changeStr = await getChangePercent(commodity, modalPrice);
        return {
            commodity,
            mandi: state ? `${market}, ${state}` : market,
            price_per_quintal: priceStr,
            change_percent: changeStr,
            arrival_date: r.arrival_date || r['Arrival Date'] || today
        };
    }));

    // Refresh the market_prices table with live data
    await pool.query('TRUNCATE TABLE market_prices');
    if (mapped.length > 0) {
        const placeholders = mapped.map(() => '(?, ?, ?, ?)').join(', ');
        const values = mapped.flatMap(r => [r.commodity, r.mandi, r.price_per_quintal, r.change_percent]);
        await pool.query(
            `INSERT INTO market_prices (commodity, mandi, price_per_quintal, change_percent) VALUES ${placeholders}`,
            values
        );
    }

    return mapped;
}

app.get('/api/market-prices', async (req, res) => {
    // Serve from cache if fresh
    const now = Date.now();
    if (marketCache.data && marketCache.fetchedAt && (now - marketCache.fetchedAt < CACHE_TTL_MS)) {
        return res.json({
            data: marketCache.data,
            source: marketCache.source,
            fetched_at: new Date(marketCache.fetchedAt).toISOString()
        });
    }

    // Try live fetch
    try {
        const liveData = await fetchLiveMarketPrices();
        marketCache = { data: liveData, fetchedAt: now, source: 'live' };
        return res.json({
            data: liveData,
            source: 'live',
            fetched_at: new Date(now).toISOString()
        });
    } catch (liveErr) {
        console.warn('⚠️  Live market fetch failed, using fallback DB data:', liveErr.message);
        // Fallback: read from DB (seeded values)
        try {
            const [rows] = await pool.query('SELECT * FROM market_prices ORDER BY updated_at DESC');
            const fallbackData = rows.map(r => ({
                commodity: r.commodity,
                mandi: r.mandi,
                price_per_quintal: r.price_per_quintal,
                change_percent: r.change_percent,
                arrival_date: null
            }));
            marketCache = { data: fallbackData, fetchedAt: now, source: 'fallback' };
            return res.json({
                data: fallbackData,
                source: 'fallback',
                fetched_at: new Date(now).toISOString()
            });
        } catch (dbErr) {
            return res.status(500).json({ error: dbErr.message });
        }
    }
});

app.get('/api/msp', async (req, res) => {
    // Serve from cache if still fresh (30 min TTL)
    const now = Date.now();
    if (mspCache.data && mspCache.fetchedAt && (now - mspCache.fetchedAt < CACHE_TTL_MS)) {
        return res.json({ data: mspCache.data, source: mspCache.source, fetched_at: new Date(mspCache.fetchedAt).toISOString() });
    }

    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) {
        const [rows] = await pool.query('SELECT * FROM msp_data');
        return res.json({ data: rows, source: 'fallback', fetched_at: new Date().toISOString() });
    }

    try {
        // data.gov.in MSP dataset — commodity-wise MSP (mandated crops)
        const url = `https://api.data.gov.in/resource/65f0d63f-0f09-4b3f-a26b-a6c70bb31a8c?api-key=${apiKey}&format=json&limit=30`;
        const json = await httpsGet(url);
        const records = json.records || [];

        if (records.length === 0) throw new Error('Empty MSP records');

        const mapped = records.map(r => ({
            id: null,
            crop: r.commodity_name || r.commodity || r.crop_name || 'Unknown',
            season: r.season_for_which_msp_is_applicable || r.season || '—',
            msp_2024: r.msp_for_2022_23 || r.msp2024 || r['2023-24'] || '—',
            msp_2025: r.msp_for_2023_24 || r.msp2025 || r['2024-25'] || '—',
            change_percent: '—'
        })).filter(r => r.crop !== 'Unknown');

        // Compute change between the two years where both are numeric
        const withChange = mapped.map(r => {
            try {
                const a = parseFloat(String(r.msp_2024).replace(/,/g, ''));
                const b = parseFloat(String(r.msp_2025).replace(/,/g, ''));
                if (a && b && a > 0) {
                    const pct = (((b - a) / a) * 100).toFixed(1);
                    return { ...r, change_percent: pct >= 0 ? `+${pct}%` : `${pct}%` };
                }
            } catch { }
            return r;
        });

        mspCache = { data: withChange, fetchedAt: now, source: 'live' };
        return res.json({ data: withChange, source: 'live', fetched_at: new Date(now).toISOString() });

    } catch (err) {
        console.warn('⚠️  Live MSP fetch failed, using DB fallback:', err.message);
        try {
            const [rows] = await pool.query('SELECT * FROM msp_data');
            mspCache = { data: rows, fetchedAt: now, source: 'fallback' };
            return res.json({ data: rows, source: 'fallback', fetched_at: new Date(now).toISOString() });
        } catch (dbErr) {
            return res.status(500).json({ error: dbErr.message });
        }
    }
});

// ── MSP cache ─────────────────────────────────────────────────────────────────
let mspCache = { data: null, fetchedAt: null, source: 'fallback' };

// ═══════════════════════════════════════════════════════════════════════════════
// CROP PRODUCTION STATS  — Live Area/Production/Yield via data.gov.in
// ═══════════════════════════════════════════════════════════════════════════════

let cropStatsCache = { data: null, fetchedAt: null, source: 'fallback' };

app.get('/api/crop-production', async (req, res) => {
    const now = Date.now();
    if (cropStatsCache.data && cropStatsCache.fetchedAt && (now - cropStatsCache.fetchedAt < CACHE_TTL_MS)) {
        return res.json({ data: cropStatsCache.data, source: cropStatsCache.source, fetched_at: new Date(cropStatsCache.fetchedAt).toISOString() });
    }
    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'DATAGOV_API_KEY not configured' });

    try {
        // Area, Production, Yield (APY) dataset — major crops, state-wise
        const url = `https://api.data.gov.in/resource/6a648c48-0421-4d59-a10d-c9a9a25d2e94?api-key=${apiKey}&format=json&limit=50`;
        const json = await httpsGet(url);
        const records = (json.records || []).map(r => ({
            state: r.state_name || r.state || '—',
            crop: r.crop_name || r.crop || '—',
            season: r.season || '—',
            year: r.crop_year || r.year || '—',
            area_ha: r.area || '—',
            production_mt: r.production || '—',
            yield_kgha: r.yield || '—',
        }));
        cropStatsCache = { data: records, fetchedAt: now, source: 'live' };
        return res.json({ data: records, source: 'live', fetched_at: new Date(now).toISOString() });
    } catch (err) {
        console.warn('⚠️  Crop production fetch failed:', err.message);
        // Offline fallback — representative static data
        const fallback = [
            { state: 'Punjab', crop: 'Wheat', season: 'Rabi', year: '2023-24', area_ha: '3,497,000', production_mt: '18,534,000', yield_kgha: '5,300' },
            { state: 'Uttar Pradesh', crop: 'Wheat', season: 'Rabi', year: '2023-24', area_ha: '9,600,000', production_mt: '35,000,000', yield_kgha: '3,645' },
            { state: 'West Bengal', crop: 'Rice', season: 'Kharif', year: '2023-24', area_ha: '5,400,000', production_mt: '15,500,000', yield_kgha: '2,870' },
            { state: 'Andhra Pradesh', crop: 'Rice', season: 'Kharif', year: '2023-24', area_ha: '3,800,000', production_mt: '12,300,000', yield_kgha: '3,237' },
            { state: 'Madhya Pradesh', crop: 'Soybean', season: 'Kharif', year: '2023-24', area_ha: '4,200,000', production_mt: '5,880,000', yield_kgha: '1,400' },
            { state: 'Rajasthan', crop: 'Mustard', season: 'Rabi', year: '2023-24', area_ha: '3,100,000', production_mt: '4,030,000', yield_kgha: '1,300' },
            { state: 'Maharashtra', crop: 'Cotton', season: 'Kharif', year: '2023-24', area_ha: '4,000,000', production_mt: '7,800,000', yield_kgha: '495' },
            { state: 'Karnataka', crop: 'Maize', season: 'Kharif', year: '2023-24', area_ha: '1,300,000', production_mt: '4,940,000', yield_kgha: '3,800' },
        ];
        cropStatsCache = { data: fallback, fetchedAt: now, source: 'fallback' };
        return res.json({ data: fallback, source: 'fallback', fetched_at: new Date(now).toISOString() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FERTILIZER AVAILABILITY  — State-wise via data.gov.in
// ═══════════════════════════════════════════════════════════════════════════════

let fertCache = { data: null, fetchedAt: null, source: 'fallback' };

app.get('/api/fertilizer-availability', async (req, res) => {
    const now = Date.now();
    if (fertCache.data && fertCache.fetchedAt && (now - fertCache.fetchedAt < CACHE_TTL_MS)) {
        return res.json({ data: fertCache.data, source: fertCache.source, fetched_at: new Date(fertCache.fetchedAt).toISOString() });
    }
    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'DATAGOV_API_KEY not configured' });

    try {
        const url = `https://api.data.gov.in/resource/8f1d0e5a-010f-4393-9c12-8313965b1a65?api-key=${apiKey}&format=json&limit=40`;
        const json = await httpsGet(url);
        const records = (json.records || []).map(r => ({
            state: r.state_name || r.state || '—',
            fertilizer: r.fertilizer_name || r.fertilizer || r.type || '—',
            requirement: r.requirement || r.requirement_mt || '—',
            availability: r.availability || r.available_mt || '—',
            balance: r.balance || '—',
            month: r.month || r.period || '—',
        }));
        fertCache = { data: records, fetchedAt: now, source: 'live' };
        return res.json({ data: records, source: 'live', fetched_at: new Date(now).toISOString() });
    } catch (err) {
        console.warn('⚠️  Fertilizer fetch failed:', err.message);
        const fallback = [
            { state: 'Punjab', fertilizer: 'Urea', requirement: '85,000', availability: '92,000', balance: '+7,000', month: 'Mar 2025' },
            { state: 'Haryana', fertilizer: 'Urea', requirement: '60,000', availability: '65,000', balance: '+5,000', month: 'Mar 2025' },
            { state: 'UP', fertilizer: 'Urea', requirement: '240,000', availability: '235,000', balance: '-5,000', month: 'Mar 2025' },
            { state: 'MP', fertilizer: 'DAP', requirement: '55,000', availability: '52,000', balance: '-3,000', month: 'Mar 2025' },
            { state: 'Maharashtra', fertilizer: 'DAP', requirement: '70,000', availability: '72,000', balance: '+2,000', month: 'Mar 2025' },
            { state: 'Gujarat', fertilizer: 'MOP', requirement: '18,000', availability: '17,500', balance: '-500', month: 'Mar 2025' },
            { state: 'Karnataka', fertilizer: 'Urea', requirement: '95,000', availability: '98,000', balance: '+3,000', month: 'Mar 2025' },
            { state: 'Rajasthan', fertilizer: 'DAP', requirement: '48,000', availability: '48,000', balance: '0', month: 'Mar 2025' },
        ];
        fertCache = { data: fallback, fetchedAt: now, source: 'fallback' };
        return res.json({ data: fallback, source: 'fallback', fetched_at: new Date(now).toISOString() });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PM-KISAN BENEFICIARY STATS  — via data.gov.in
// ═══════════════════════════════════════════════════════════════════════════════

let pmkisanCache = { data: null, fetchedAt: null, source: 'fallback' };

app.get('/api/pmkisan-stats', async (req, res) => {
    const now = Date.now();
    if (pmkisanCache.data && pmkisanCache.fetchedAt && (now - pmkisanCache.fetchedAt < CACHE_TTL_MS)) {
        return res.json({ data: pmkisanCache.data, source: pmkisanCache.source, fetched_at: new Date(pmkisanCache.fetchedAt).toISOString() });
    }
    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'DATAGOV_API_KEY not configured' });

    try {
        const url = `https://api.data.gov.in/resource/72ecce63-c5e5-4df9-b5c9-efe9ded5dd16?api-key=${apiKey}&format=json&limit=40`;
        const json = await httpsGet(url);
        const records = (json.records || []).map(r => ({
            state: r.state_name || r.state || '—',
            district: r.district_name || r.district || '—',
            beneficiaries_male: r.male || r.no_of_male_beneficiaries || '—',
            beneficiaries_female: r.female || r.no_of_female_beneficiaries || '—',
            total_beneficiaries: r.total || r.total_beneficiaries || '—',
            installment: r.installment_no || r.installment || '—',
        }));
        pmkisanCache = { data: records, fetchedAt: now, source: 'live' };
        return res.json({ data: records, source: 'live', fetched_at: new Date(now).toISOString() });
    } catch (err) {
        console.warn('⚠️  PM-KISAN fetch failed:', err.message);
        const fallback = [
            { state: 'Uttar Pradesh', district: 'All', beneficiaries_male: '14,200,000', beneficiaries_female: '3,800,000', total_beneficiaries: '18,000,000', installment: '17' },
            { state: 'Rajasthan', district: 'All', beneficiaries_male: '5,100,000', beneficiaries_female: '1,100,000', total_beneficiaries: '6,200,000', installment: '17' },
            { state: 'Madhya Pradesh', district: 'All', beneficiaries_male: '5,400,000', beneficiaries_female: '1,600,000', total_beneficiaries: '7,000,000', installment: '17' },
            { state: 'Maharashtra', district: 'All', beneficiaries_male: '5,700,000', beneficiaries_female: '1,800,000', total_beneficiaries: '7,500,000', installment: '17' },
            { state: 'Karnataka', district: 'All', beneficiaries_male: '3,100,000', beneficiaries_female: '900,000', total_beneficiaries: '4,000,000', installment: '17' },
            { state: 'Punjab', district: 'All', beneficiaries_male: '1,400,000', beneficiaries_female: '280,000', total_beneficiaries: '1,680,000', installment: '17' },
            { state: 'Haryana', district: 'All', beneficiaries_male: '1,200,000', beneficiaries_female: '220,000', total_beneficiaries: '1,420,000', installment: '17' },
            { state: 'West Bengal', district: 'All', beneficiaries_male: '4,600,000', beneficiaries_female: '1,200,000', total_beneficiaries: '5,800,000', installment: '17' },
        ];
        pmkisanCache = { data: fallback, fetchedAt: now, source: 'fallback' };
        return res.json({ data: fallback, source: 'fallback', fetched_at: new Date(now).toISOString() });
    }
});



// ═══════════════════════════════════════════════════════════════════════════════
// MASTER SEED ROUTE  — POST /api/seed
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/seed', async (req, res) => {
    const seedSecret = process.env.SEED_SECRET || 'agriroots-seed-2025';
    const provided = req.headers['x-seed-secret'];
    if (provided !== seedSecret) {
        return res.status(403).json({ message: '⛔ Forbidden. Invalid or missing seed secret.' });
    }
    try {
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE TABLE services');
        await pool.query('TRUNCATE TABLE shop_items');
        await pool.query('TRUNCATE TABLE crops');
        await pool.query('TRUNCATE TABLE crop_diseases');
        await pool.query('TRUNCATE TABLE seasonal_patterns');
        await pool.query('TRUNCATE TABLE agri_crops_guide');
        await pool.query('TRUNCATE TABLE agri_tools');
        await pool.query('TRUNCATE TABLE agri_products');
        await pool.query('TRUNCATE TABLE agri_policies');
        await pool.query('TRUNCATE TABLE agri_loans');
        await pool.query('TRUNCATE TABLE market_prices');
        await pool.query('TRUNCATE TABLE msp_data');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // ── Services
        const services = [
            ['Crops', 'Explore crop varieties', 'Know more', 'blue', '/services/crops'],
            ['Organic Methods', 'Natural farming solutions', 'Know more', 'blue', '/services/organic'],
            ['Agri-Inputs & Tools', 'Seeds, Tools, Fertilizers & more', 'Purchase', 'green', '/services/agri-inputs'],
            ['pH Test', 'Test your soil health', 'Visit', 'blue', '/services/phtest'],
            ['Crop Insurance', 'Protect your harvest', 'Get Insured', 'red', '/services/insurance'],
            ['Market Prices', 'Live commodity rates', 'View Prices', 'yellow', '/services/market'],
            ['MSP Check', 'Minimum Support Price info', 'Check Now', 'teal', '/services/msp'],
            ['Weather Reports', 'Real-time forecasts & alerts', 'Forecast', 'teal', '/services/weather'],
            ['Crop Production Stats', 'National APY data from Govt.', 'View Stats', 'green', '/services/crop-stats'],
            ['Fertilizer Availability', 'State-wise supply & demand', 'Check Now', 'yellow', '/services/fertilizer'],
            ['PM-KISAN Beneficiaries', 'State-wise beneficiary data', 'View Data', 'blue', '/services/govt-schemes'],
        ];
        const sPlaceholders = services.map(() => '(?, ?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO services (title, \`desc\`, btn, color, path) VALUES ${sPlaceholders}`, services.flat());

        // ── Shop Items
        const shopItems = [
            ['Heavy Duty Rotavator', '₹45,000', 'Tools', 'fa-tractor'],
            ['Drip Irrigation Kit', '₹12,000 / acre', 'Tools', 'fa-faucet-drip'],
            ['Seed Drill Machine', '₹35,000', 'Tools', 'fa-tractor'],
            ['Hybrid Wheat Seeds (10kg)', '₹450', 'Seeds', 'fa-wheat-awn'],
            ['High-Yield Rice Seeds (25kg)', '₹1,200', 'Seeds', 'fa-wheat-awn'],
            ['Organic Tomato Seeds (50g)', '₹150', 'Seeds', 'fa-seedling'],
            ['Urea (Nitrogen) 50kg', '₹266', 'Fertilizers', 'fa-sack-xmark'],
            ['DAP Liquid Formulation (1L)', '₹1,200', 'Fertilizers', 'fa-bottle-droplet'],
            ['Organic Vermicompost 50kg', '₹400', 'Fertilizers', 'fa-sack-xmark'],
            ['Selective Herbicide (1L)', '₹600', 'Weed Control', 'fa-plant-wilt'],
            ['Mechanical Weed Puller', '₹1,500', 'Weed Control', 'fa-tractor'],
            ['Neem Oil Extract (2L)', '₹700', 'Pesticides', 'fa-bug-slash'],
            ['Broad-Spectrum Insecticide', '₹1,100', 'Pesticides', 'fa-bug']
        ];
        const siP = shopItems.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO shop_items (name, price, tag, icon) VALUES ${siP}`, shopItems.flat());

        // ── Crops & Diseases
        const cropRows = [
            ['wheat', 'Wheat', 'fa-wheat-awn', 'Rabi (Winter)', '120-150 days', 'Cool and moist during growth, dry and warm during ripening.', 'Well-drained loamy or clayey soils.', 'High', 'Consistent demand and government MSP guarantees stable income.'],
            ['rice', 'Rice (Paddy)', 'fa-seedling', 'Kharif (Monsoon)', '90-150 days', 'High temperature and high humidity with prolonged sunshine.', 'Clayey loams which can retain water well.', 'High', 'High domestic consumption and export potential ensure good returns.'],
            ['cotton', 'Cotton', 'fa-cloud', 'Kharif / Zaid', '150-180 days', 'Warm climate. Requires 210 frost-free days and bright sunshine.', 'Deep black soil (Regur) or well-drained loams.', 'Very High (Cash Crop)', 'Excellent commercial value in textile industries. High profit margins.'],
            ['mustard', 'Mustard', 'fa-spa', 'Rabi (Winter)', '110-140 days', 'Cool and dry weather. Sensitive to frost.', 'Light loam to heavy loam soils.', 'Medium-High', 'Requires less water and input costs, yielding high edible oil prices.'],
            ['maize', 'Maize', 'fa-seedling', 'Kharif (Jun-Sep)', '75-95 days', 'Warm climate with moderate rainfall and good sunlight.', 'Well-drained sandy loam or loamy soils.', 'Medium-High', 'Versatile crop used for food, fodder, and starch industries.'],
            ['sugarcane', 'Sugarcane', 'fa-wheat-awn', 'Year-round', '10-12 months', 'Hot and humid climate with adequate rainfall.', 'Deep, well-drained loamy soils rich in organic matter.', 'High', 'High commercial value for sugar, jaggery, and ethanol production.']
        ];
        const diseaseMap = {
            'wheat': [['Leaf Rust', 'Plant resistant varieties and apply fungicides like Propiconazole at early stages.'], ['Loose Smut', 'Treat seeds with Vitavax or Carbendazim before sowing.']],
            'rice': [['Rice Blast', 'Avoid excessive nitrogen. Use Tricyclazole fungicide.'], ['Bacterial Blight', 'Use resistant varieties and apply copper-based compounds.']],
            'cotton': [['Pink Bollworm', 'Use Bt-cotton varieties and install pheromone traps.'], ['Whitefly / Leaf Curl', 'Spray Neem oil or Imidacloprid to control vectors.']],
            'mustard': [['White Rust', 'Spray Mancozeb or Ridomil MZ.'], ['Aphids', 'Apply Dimethoate or spray Neem seed kernel extract.']],
            'maize': [['Fall Armyworm', 'Apply Emamectin benzoate or Spinetoram sprays.'], ['Corn Smut', 'Use certified disease-free seeds and crop rotation.']],
            'sugarcane': [['Red Rot', 'Use disease-free sets and treat with Carbendazim.'], ['Wilt', 'Maintain proper drainage and use resistant varieties.']]
        };
        for (const crop of cropRows) {
            const [result] = await pool.query('INSERT INTO crops (slug, name, icon, season, cycle, climate, soil, profitability, profitDesc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', crop);
            const cropId = result.insertId;
            const diseases = diseaseMap[crop[0]] || [];
            if (diseases.length > 0) {
                const mapped = diseases.map(d => [cropId, d[0], d[1]]);
                const dP = mapped.map(() => '(?, ?, ?)').join(', ');
                await pool.query(`INSERT INTO crop_diseases (crop_id, name, remedy) VALUES ${dP}`, mapped.flat());
            }
        }

        // ── Seasonal Patterns
        const seasons = [
            ['Kharif', 'Monsoon (July - Oct)', 'Rice, Maize, Sorghum, Pearl Millet, Finger Millet, Cotton.'],
            ['Rabi', 'Winter (Oct - March)', 'Wheat, Barley, Oats, Chickpea, Mustard, Linseed.'],
            ['Zaid', 'Summer (March - June)', 'Watermelon, Muskmelon, Cucumber, Vegetables, Fodder crops.']
        ];
        const seaP = seasons.map(() => '(?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO seasonal_patterns (season, weather, crops) VALUES ${seaP}`, seasons.flat());

        // ── Agri Crops Guide (for AgricultureData component)
        const agriCrops = [
            ['Wheat', '🌾', 'Rabi (Oct-Mar)', '120-150 days', '25-30 quintals'],
            ['Rice', '🍚', 'Kharif (Jun-Oct)', '90-120 days', '30-35 quintals'],
            ['Maize', '🌽', 'Kharif (Jun-Sep)', '75-90 days', '20-25 quintals'],
            ['Potato', '🥔', 'Rabi (Oct-Feb)', '90-120 days', '150-200 quintals'],
            ['Sugarcane', '🎋', 'Year-round', '10-12 months', '300-400 quintals'],
            ['Pulses (Dal)', '🥣', 'Rabi/Kharif', '60-90 days', '8-12 quintals'],
            ['Mustard', '🌻', 'Rabi (Oct-Mar)', '90-100 days', '10-15 quintals'],
            ['Tomato', '🍅', 'Year-round', '60-80 days', '250-300 quintals']
        ];
        const acP = agriCrops.map(() => '(?, ?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO agri_crops_guide (name, icon, season, duration, yield_per_acre) VALUES ${acP}`, agriCrops.flat());

        // ── Agri Tools
        const tools = [
            ['Tractor', 'Heavy Machinery', 'Plowing, Tilling, Towing', '₹3L - ₹10L'],
            ['Seed Drill', 'Sowing Equipment', 'Uniform seed spacing and depth placement', '₹40K - ₹80K'],
            ['Rotavator', 'Tillage Equipment', 'Seedbed preparation in a single pass', '₹80K - ₹1.5L'],
            ['Power Sprayer', 'Application Equipment', 'Efficient pesticide and liquid fertilizer application', '₹5K - ₹15K'],
            ['Combine Harvester', 'Harvesting Equipment', 'One-pass harvesting and threshing of grain crops', '₹15L - ₹25L'],
            ['Drip Irrigation Kit', 'Irrigation Equipment', 'Targeted water delivery directly to root zones', '₹12K - ₹40K / acre']
        ];
        const tP = tools.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO agri_tools (name, category, \`use\`, price_range) VALUES ${tP}`, tools.flat());

        // ── Agri Products
        const products = [
            ['Urea (Nitrogen)', 'Fertilizer', 'Chemical', 'As per soil test'],
            ['DAP', 'Fertilizer', 'Chemical', 'Base application'],
            ['Neem Oil', 'Pesticide', 'Organic', '3-5 ml per liter'],
            ['Trichoderma', 'Bio-Fungicide', 'Organic/Bio', '5-10 gm per kg seed'],
            ['Vermicompost', 'Fertilizer', 'Organic', '2-4 tonnes per acre'],
            ['Chlorpyrifos', 'Pesticide', 'Chemical', '2 ml per liter of water']
        ];
        const prP = products.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO agri_products (name, category, type, dosage) VALUES ${prP}`, products.flat());

        // ── Agri Policies
        const policies = [
            ['PM-KISAN', 'Direct Benefit Transfer', '₹6,000 per year in three equal installments to farmer families.', 'All landholding farmers'],
            ['PMFBY', 'Crop Insurance', 'Financial support in event of failure of any of the notified crop.', 'Loanee & Non-loanee farmers'],
            ['KCC', 'Credit/Loan', 'Provides adequate and timely credit support via single window.', 'Owner Cultivators, Tenant Farmers'],
            ['Soil Health Card', 'Testing & Advisory', 'Provides crop-wise recommendations of nutrients and fertilizers.', 'All farmers across India'],
            ['PM Kusum Yojana', 'Solar Farming', 'Solar pumps and grid-connected power plants for farmers.', 'Farmers with agricultural land'],
            ['RKVY', 'Agri Development', 'Rashtriya Krishi Vikas Yojana for agricultural growth.', 'All states and UTs']
        ];
        const plP = policies.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO agri_policies (name, category, details, eligibility) VALUES ${plP}`, policies.flat());

        // ── Agri Loans
        const loans = [
            ['Crop Loan (KCC)', 'SBI / PNB / BOI', '7% p.a. (4% with subvention)', 'Up to ₹3 Lakhs'],
            ['Farm Mechanization Loan', 'NABARD', '8.5% - 10% p.a.', 'Up to ₹10 Lakhs'],
            ['Dairy/Poultry Loan', 'Regional Rural Banks', '9% p.a.', 'Up to ₹5 Lakhs'],
            ['Agri-Clinic & Agri-Business Center', 'Commercial Banks', 'Repo Rate + 2%', 'Up to ₹20 Lakhs'],
            ['Allied Activities Loan', 'Co-operative Banks', '8% - 11% p.a.', 'Up to ₹8 Lakhs'],
            ['Land Development Loan', 'Land Development Banks', '9.5% p.a.', 'Up to ₹25 Lakhs']
        ];
        const lnP = loans.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO agri_loans (name, issuer, interest, amount) VALUES ${lnP}`, loans.flat());

        // ── Market Prices
        const marketPrices = [
            ['Wheat', 'Azadpur Mandi, Delhi', '₹2,180/Qtl', '+1.2%'],
            ['Rice (Basmati)', 'Karnal Mandi, Haryana', '₹3,800/Qtl', '-0.5%'],
            ['Cotton', 'Rajkot APMC, Gujarat', '₹6,200/Qtl', '+2.8%'],
            ['Onion', 'Nashik Mandi, MH', '₹1,450/Qtl', '-3.1%'],
            ['Tomato', 'Kolar APMC, Karnataka', '₹2,200/Qtl', '+5.4%'],
            ['Mustard', 'Kota Mandi, Rajasthan', '₹5,100/Qtl', '+0.9%'],
            ['Maize', 'Gulbarga APMC, Karnataka', '₹1,850/Qtl', '+1.5%'],
            ['Soybean', 'Indore Mandi, MP', '₹4,300/Qtl', '-1.2%']
        ];
        const mpP = marketPrices.map(() => '(?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO market_prices (commodity, mandi, price_per_quintal, change_percent) VALUES ${mpP}`, marketPrices.flat());

        // ── MSP Data
        const mspData = [
            ['Wheat', 'Rabi', '₹2,015', '₹2,275', '+3.8%'],
            ['Rice (Common)', 'Kharif', '₹2,183', '₹2,300', '+5.4%'],
            ['Cotton (Medium Staple)', 'Kharif', '₹6,080', '₹7,121', '+17.1%'],
            ['Mustard', 'Rabi', '₹5,450', '₹5,950', '+9.2%'],
            ['Maize', 'Kharif', '₹1,962', '₹2,090', '+6.5%'],
            ['Soybean', 'Kharif', '₹4,300', '₹4,892', '+13.8%'],
            ['Groundnut', 'Kharif', '₹5,850', '₹6,783', '+15.9%'],
            ['Sugarcane (FRP)', 'Year-round', '₹305/Qtl', '₹340/Qtl', '+11.5%']
        ];
        const mspP = mspData.map(() => '(?, ?, ?, ?, ?)').join(', ');
        await pool.query(`INSERT INTO msp_data (crop, season, msp_2024, msp_2025, change_percent) VALUES ${mspP}`, mspData.flat());

        res.status(201).json({ message: '🌱 Database fully seeded! All 12 datasets loaded successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK / COMMUNITY ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/feedback — list top-level comments (paginated); optionally filter by category
app.get('/api/feedback', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const category = req.query.category || null;

        let baseQuery = `
            SELECT f.id, f.parent_id, f.category, f.rating, f.message, f.likes, f.created_at,
                   u.id AS user_id, u.fullName, u.profileImage, u.membershipType
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.parent_id IS NULL
        `;
        const params = [];
        if (category && category !== 'All') {
            baseQuery += ' AND f.category = ?';
            params.push(category);
        }
        baseQuery += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [comments] = await pool.query(baseQuery, params);

        // Fetch replies for each comment
        if (comments.length > 0) {
            const ids = comments.map(c => c.id);
            const [replies] = await pool.query(`
                SELECT f.id, f.parent_id, f.category, f.rating, f.message, f.likes, f.created_at,
                       u.id AS user_id, u.fullName, u.profileImage, u.membershipType
                FROM feedback f
                JOIN users u ON f.user_id = u.id
                WHERE f.parent_id IN (?) ORDER BY f.created_at ASC
            `, [ids]);
            comments.forEach(c => { c.replies = replies.filter(r => r.parent_id === c.id); });
        }

        // Count total for pagination
        let countQuery = 'SELECT COUNT(*) AS total FROM feedback WHERE parent_id IS NULL';
        const countParams = [];
        if (category && category !== 'All') {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }
        const [[{ total }]] = await pool.query(countQuery, countParams);

        res.json({ comments, total, limit, offset });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/feedback — post a new top-level comment (protected)
app.post('/api/feedback', authenticateToken, async (req, res) => {
    try {
        const { message, category = 'General', rating } = req.body;
        if (!message || message.trim().length < 3) {
            return res.status(400).json({ message: 'Message must be at least 3 characters.' });
        }
        if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const [result] = await pool.query(
            'INSERT INTO feedback (user_id, category, rating, message) VALUES (?, ?, ?, ?)',
            [req.user.id, category, rating || null, message.trim()]
        );
        const [[newComment]] = await pool.query(`
            SELECT f.id, f.parent_id, f.category, f.rating, f.message, f.likes, f.created_at,
                   u.id AS user_id, u.fullName, u.profileImage, u.membershipType
            FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.id = ?
        `, [result.insertId]);
        newComment.replies = [];
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/feedback/:id/reply — reply to a comment (protected)
app.post('/api/feedback/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim().length < 3) {
            return res.status(400).json({ message: 'Reply must be at least 3 characters.' });
        }
        const parentId = parseInt(req.params.id);
        const [[parent]] = await pool.query('SELECT id FROM feedback WHERE id = ? AND parent_id IS NULL', [parentId]);
        if (!parent) return res.status(404).json({ message: 'Comment not found.' });

        const [result] = await pool.query(
            'INSERT INTO feedback (user_id, parent_id, message) VALUES (?, ?, ?)',
            [req.user.id, parentId, message.trim()]
        );
        const [[reply]] = await pool.query(`
            SELECT f.id, f.parent_id, f.category, f.rating, f.message, f.likes, f.created_at,
                   u.id AS user_id, u.fullName, u.profileImage, u.membershipType
            FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.id = ?
        `, [result.insertId]);
        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/feedback/:id/like — increment likes
app.post('/api/feedback/:id/like', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE feedback SET likes = likes + 1 WHERE id = ?', [req.params.id]);
        const [[{ likes }]] = await pool.query('SELECT likes FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/feedback/:id — delete own comment (protected)
app.delete('/api/feedback/:id', authenticateToken, async (req, res) => {
    try {
        const [[comment]] = await pool.query('SELECT user_id FROM feedback WHERE id = ?', [req.params.id]);
        if (!comment) return res.status(404).json({ message: 'Comment not found.' });
        if (comment.user_id !== req.user.id) return res.status(403).json({ message: 'You can only delete your own comments.' });
        await pool.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ message: 'Comment deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({ message: '🌿 AgriRoots API is running!', status: 'OK', version: '2.0' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port: ${PORT}`);
    });
}

// Initialize database tables (important for Vercel serverless cold starts)
initDB().catch(err => console.error("Database initialization failed:", err));

module.exports = app;
