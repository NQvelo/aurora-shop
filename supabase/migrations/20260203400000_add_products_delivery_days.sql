-- Number of days to deliver this product to the customer. Shown on product page and checkout.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS delivery_days INTEGER;

COMMENT ON COLUMN products.delivery_days IS 'Estimated delivery time in days. Shown on product page and checkout (max across cart).';
