-- V2__rollback_standardize_schema_column_names_and_drop_audit_log.sql
-- Rollback V1 using normal forward migration because Flyway OSS does not support flyway undo.
-- This migration brings the database schema back to the original state before V1.

-- Drop indexes created in V1
DROP INDEX IF EXISTS idx_coupon_usage_user_coupon;
DROP INDEX IF EXISTS idx_coupons_code;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_users_email;

-- Drop audit log table created in V1
DROP TABLE IF EXISTS audit_logs;

-- Rename columns back to original names
ALTER TABLE coupon_usage RENAME COLUMN redeemed_at TO used_at;

ALTER TABLE coupons RENAME COLUMN expires_at TO expired_at;

ALTER TABLE orders RENAME COLUMN delivery_address TO shipping_address;
ALTER TABLE orders RENAME COLUMN grand_total_amount TO total_amount;

ALTER TABLE products RENAME COLUMN image_url TO imageUrl;

ALTER TABLE users RENAME COLUMN phone_number TO phone;