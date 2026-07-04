-- V1__standardize_schema_column_names_and_add_audit_log.sql
-- Purpose:
-- 1. Practice Flyway migration on the existing SQLite database.
-- 2. Rename several columns to a clearer naming convention.
-- 3. Add a small audit_logs table and indexes for a more meaningful DB change.
--
-- Important:
-- This migration is for DB migration/rollback practice.
-- If the backend app is run after this migration, related SQL in server.js may also need updates.

-- USERS: make contact field clearer
ALTER TABLE users RENAME COLUMN phone TO phone_number;

-- PRODUCTS: convert camelCase to snake_case for DB naming consistency
ALTER TABLE products RENAME COLUMN imageUrl TO image_url;

-- ORDERS: make business meaning clearer
ALTER TABLE orders RENAME COLUMN total_amount TO grand_total_amount;
ALTER TABLE orders RENAME COLUMN shipping_address TO delivery_address;

-- COUPONS: make expiration field clearer
ALTER TABLE coupons RENAME COLUMN expired_at TO expires_at;

-- COUPON USAGE: make action clearer
ALTER TABLE coupon_usage RENAME COLUMN used_at TO redeemed_at;

-- Add an audit table to record simple system/database events
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_name TEXT NOT NULL,
  entity_id INTEGER,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes to improve common lookup/search operations
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_coupon ON coupon_usage(user_id, coupon_id);