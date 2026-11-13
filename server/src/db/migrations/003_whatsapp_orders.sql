-- WhatsApp ordering.
-- Customers can order without an account, so an order may have no user.
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- When the customer wants to collect it (NULL = as soon as possible), and their notes.
ALTER TABLE orders ADD COLUMN pickup_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN notes TEXT;

-- New orders wait for the customer to send them on WhatsApp ("pending"),
-- then staff mark them "confirmed" once the message arrives.
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'placed', 'preparing', 'ready', 'completed', 'cancelled'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
