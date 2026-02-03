-- Whether this product has size options (e.g. clothing). If false, size selector is hidden on product page.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS has_sizes BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.has_sizes IS 'If false, product page does not show size selector and add-to-cart uses One Size';
