-- Human-friendly 7-character alphanumeric order ID (e.g. A1B2C3D). Shown to users and admin.
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number VARCHAR(7) UNIQUE;

CREATE INDEX IF NOT EXISTS orders_order_number_key ON orders (order_number) WHERE order_number IS NOT NULL;

COMMENT ON COLUMN orders.order_number IS '7-char alphanumeric display ID (0-9, A-Z). Generated on insert.';
