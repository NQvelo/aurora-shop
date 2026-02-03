-- Timestamps for each status so we know when the order entered that stage
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.accepted_at IS 'When admin set status to accepted';
COMMENT ON COLUMN orders.processing_at IS 'When admin set status to processing';
COMMENT ON COLUMN orders.shipped_at IS 'When admin set status to shipped';
COMMENT ON COLUMN orders.delivered_at IS 'When admin set status to delivered';
