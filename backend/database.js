const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const seedFilePath = path.resolve(__dirname, 'seed-data.json');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

function createSchema() {
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS coupon_usage');
        db.run('DROP TABLE IF EXISTS coupons');
        db.run('DROP TABLE IF EXISTS users');
        db.run('DROP TABLE IF EXISTS products');
        db.run('DROP TABLE IF EXISTS categories');
        db.run('DROP TABLE IF EXISTS orders');

        db.run(`CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )`);

        db.run(`CREATE TABLE coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE,
            type TEXT DEFAULT 'percent',
            discount_value INTEGER,
            min_order_amount INTEGER DEFAULT 0,
            expired_at DATETIME,
            is_active INTEGER DEFAULT 1,
            max_uses_per_user INTEGER DEFAULT 1
        )`);

        db.run(`CREATE TABLE coupon_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coupon_id INTEGER,
            user_id INTEGER,
            used_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT,
            role TEXT DEFAULT 'user',
            login_attempts INTEGER DEFAULT 0,
            locked_until DATETIME,
            reset_token TEXT,
            shipping_address TEXT,
            phone TEXT
        )`);

        db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            description TEXT,
            imageUrl TEXT,
            category_id INTEGER
        )`);

        db.run(`CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount INTEGER,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

function seedDatabase() {
    if (!fs.existsSync(seedFilePath)) {
        console.error('Seed file not found:', seedFilePath);
        return;
    }

    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

    const insertRows = (table, columns, rows) => {
        if (!rows || rows.length === 0) return;
        const placeholders = columns.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
        rows.forEach((row) => {
            const values = columns.map((column) => row[column]);
            stmt.run(values, (err) => {
                if (err) {
                    console.error(`Failed to insert into ${table}:`, err.message);
                }
            });
        });
        stmt.finalize();
    };

    db.serialize(() => {
        insertRows('categories', ['name'], seedData.categories);
        insertRows('users', ['name', 'email', 'password', 'role'], seedData.users);
        insertRows('products', ['name', 'price', 'description', 'imageUrl', 'category_id'], seedData.products);
        insertRows('coupons', ['code', 'type', 'discount_value', 'min_order_amount', 'expired_at', 'is_active', 'max_uses_per_user'], seedData.coupons);
        insertRows('orders', ['user_id', 'total_amount', 'status', 'shipping_address'], seedData.orders);
        insertRows('coupon_usage', ['coupon_id', 'user_id', 'used_at'], seedData.coupon_usage);
    });
}

function initDatabase() {
    createSchema();
    seedDatabase();
    console.log('Database initialized and seeded from seed-data.json.');
}

initDatabase();

module.exports = db;
