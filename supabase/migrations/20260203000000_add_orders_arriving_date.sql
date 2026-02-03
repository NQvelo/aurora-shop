-- Add arriving_date to orders so admin can set when the product will arrive at the customer
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS arriving_date DATE;

COMMENT ON COLUMN orders.arriving_date IS 'Date when the order is expected to arrive at the customer (set by admin)';
