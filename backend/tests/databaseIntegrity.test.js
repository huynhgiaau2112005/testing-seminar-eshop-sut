const db = require('../database');

// Helper to run query returning all rows
function queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Helper to run insert/update/delete commands
function runCmd(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

describe('Database Integrity Tests', () => {

    // Close database connection after all tests complete
    afterAll((done) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            done();
        });
    });

    describe('1. Product Category Referential Integrity', () => {
        const checkSql = `
      SELECT id, name, category_id 
      FROM products 
      WHERE category_id IS NOT NULL 
        AND category_id NOT IN (SELECT id FROM categories)
    `;

        test('should have 0 violating products in a healthy database', async () => {
            const violations = await queryAll(checkSql);
            expect(violations.length).toBe(0);
        });

        test('should detect products referencing non-existent categories', async () => {
            const insertSql = `
        INSERT INTO products (name, price, description, imageUrl, category_id)
        VALUES ('Test Orphan Product', 1000, 'Description', 'http://example.com/img.jpg', 9999)
      `;
            const result = await runCmd(insertSql);
            const insertedId = result.lastID;

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].id).toBe(insertedId);
                expect(violations[0].category_id).toBe(9999);
            } finally {
                await runCmd('DELETE FROM products WHERE id = ?', [insertedId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });
    });

    describe('2. Order User Referential Integrity', () => {
        const checkSql = `
      SELECT id, user_id, total_amount 
      FROM orders 
      WHERE user_id NOT IN (SELECT id FROM users)
    `;

        test('should have 0 violating orders in a healthy database', async () => {
            const violations = await queryAll(checkSql);
            expect(violations.length).toBe(0);
        });

        test('should detect orders referencing non-existent users', async () => {
            const insertSql = `
        INSERT INTO orders (user_id, total_amount, status, shipping_address)
        VALUES (9999, 150000, 'pending', '123 Test St')
      `;
            const result = await runCmd(insertSql);
            const insertedId = result.lastID;

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].id).toBe(insertedId);
                expect(violations[0].user_id).toBe(9999);
            } finally {
                await runCmd('DELETE FROM orders WHERE id = ?', [insertedId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });
    });

    describe('3. Unique User Email Integrity', () => {
        const checkSql = `
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING count > 1
    `;

        test('should have 0 duplicate emails in a healthy database', async () => {
            const violations = await queryAll(checkSql);
            expect(violations.length).toBe(0);
        });

        test('should detect duplicate user emails', async () => {
            const users = await queryAll('SELECT email FROM users LIMIT 1');
            expect(users.length).toBeGreaterThan(0);
            const existingEmail = users[0].email;

            const insertSql = `
        INSERT INTO users (name, email, password, role)
        VALUES ('Duplicate User', ?, 'password123', 'user')
      `;
            const result = await runCmd(insertSql, [existingEmail]);
            const insertedId = result.lastID;

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].email).toBe(existingEmail);
                expect(violations[0].count).toBe(2);
            } finally {
                await runCmd('DELETE FROM users WHERE id = ?', [insertedId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });
    });

    describe('4. Coupon Usage Limit Integrity', () => {
        const checkSql = `
      SELECT cu.user_id, cu.coupon_id, COUNT(*) as usage_count, c.max_uses_per_user
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      GROUP BY cu.user_id, cu.coupon_id
      HAVING usage_count > c.max_uses_per_user
    `;

        let deletedUsages = [];

        beforeAll(async () => {
            // Clean up the duplicate seed coupon usage (coupon 1, user 2) to ensure a healthy start
            const duplicateUsage = await queryAll(`
        SELECT id, coupon_id, user_id, used_at FROM coupon_usage 
        WHERE coupon_id = 1 AND user_id = 2 
        ORDER BY id ASC
      `);
            if (duplicateUsage.length > 1) {
                for (let i = 1; i < duplicateUsage.length; i++) {
                    const usage = duplicateUsage[i];
                    deletedUsages.push(usage);
                    await runCmd('DELETE FROM coupon_usage WHERE id = ?', [usage.id]);
                }
            }
        });

        afterAll(async () => {
            // Restore deleted usages to leave the database in its original state
            for (const usage of deletedUsages) {
                await runCmd(
                    'INSERT INTO coupon_usage (id, coupon_id, user_id, used_at) VALUES (?, ?, ?, ?)',
                    [usage.id, usage.coupon_id, usage.user_id, usage.used_at]
                );
            }
        });

        test('should have 0 violations of coupon usage limits in a healthy database', async () => {
            const violations = await queryAll(checkSql);
            expect(violations.length).toBe(0);
        });

        test('should detect when a user exceeds a coupon usage limit', async () => {
            const couponResult = await runCmd(`
        INSERT INTO coupons (code, type, discount_value, min_order_amount, is_active, max_uses_per_user)
        VALUES ('TESTLIMIT', 'percent', 10, 0, 1, 1)
      `);
            const couponId = couponResult.lastID;

            const users = await queryAll('SELECT id FROM users LIMIT 1');
            expect(users.length).toBeGreaterThan(0);
            const userId = users[0].id;

            const usage1 = await runCmd(`INSERT INTO coupon_usage (coupon_id, user_id) VALUES (?, ?)`, [couponId, userId]);
            const usage2 = await runCmd(`INSERT INTO coupon_usage (coupon_id, user_id) VALUES (?, ?)`, [couponId, userId]);

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].coupon_id).toBe(couponId);
                expect(violations[0].user_id).toBe(userId);
                expect(violations[0].usage_count).toBe(2);
                expect(violations[0].max_uses_per_user).toBe(1);
            } finally {
                await runCmd('DELETE FROM coupon_usage WHERE id IN (?, ?)', [usage1.lastID, usage2.lastID]);
                await runCmd('DELETE FROM coupons WHERE id = ?', [couponId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });
    });

    describe('5. Product Price and Order Amount Domain Integrity', () => {
        const checkSql = `
      SELECT 'product' as type, id, price as invalid_value FROM products WHERE price <= 0
      UNION ALL
      SELECT 'order' as type, id, total_amount as invalid_value FROM orders WHERE total_amount < 0
    `;

        test('should have 0 products with <=0 price and 0 orders with <0 total in a healthy database', async () => {
            const violations = await queryAll(checkSql);
            expect(violations.length).toBe(0);
        });

        test('should detect negative or zero product prices', async () => {
            const result = await runCmd(`
        INSERT INTO products (name, price, description, imageUrl, category_id)
        VALUES ('Negative Price Product', -50, 'Invalid Price', '', 1)
      `);
            const insertedId = result.lastID;

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].type).toBe('product');
                expect(violations[0].id).toBe(insertedId);
                expect(violations[0].invalid_value).toBe(-50);
            } finally {
                await runCmd('DELETE FROM products WHERE id = ?', [insertedId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });

        test('should detect negative order total amounts', async () => {
            const result = await runCmd(`
        INSERT INTO orders (user_id, total_amount, status, shipping_address)
        VALUES (1, -100, 'pending', '123 Test St')
      `);
            const insertedId = result.lastID;

            try {
                const violations = await queryAll(checkSql);
                expect(violations.length).toBe(1);
                expect(violations[0].type).toBe('order');
                expect(violations[0].id).toBe(insertedId);
                expect(violations[0].invalid_value).toBe(-100);
            } finally {
                await runCmd('DELETE FROM orders WHERE id = ?', [insertedId]);
            }

            const violationsAfterCleanup = await queryAll(checkSql);
            expect(violationsAfterCleanup.length).toBe(0);
        });
    });
});
