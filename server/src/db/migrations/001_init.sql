-- Coffee Cinnamon — initial schema.
-- Money is stored in whole rupees (INTEGER). Times are TIMESTAMPTZ.

CREATE TABLE partners (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  area          TEXT NOT NULL,
  distance_km   NUMERIC(5,1) NOT NULL,      -- approximate, entered by hand (no mapping service)
  needs_per_day INTEGER NOT NULL,           -- meals they usually want each evening
  capacity      INTEGER NOT NULL,           -- most portions they can carry/store
  window_start  SMALLINT NOT NULL,          -- usual collection window, minutes after midnight
  window_end    SMALLINT NOT NULL,
  veg_only      BOOLEAN NOT NULL DEFAULT FALSE,
  contact       TEXT NOT NULL,
  note          TEXT
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'STAFF', 'PARTNER')),
  phone         TEXT,
  partner_id    TEXT REFERENCES partners(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (role <> 'PARTNER' OR partner_id IS NOT NULL)
);

CREATE TABLE menu_items (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT NOT NULL,
  price          INTEGER NOT NULL CHECK (price > 0),
  veg            BOOLEAN NOT NULL,
  rating         NUMERIC(2,1),
  popularity     INTEGER NOT NULL DEFAULT 0,
  image          TEXT,
  sizes          JSONB NOT NULL DEFAULT '[]',   -- [{ "label": "Large", "extra": 30 }]
  addons         JSONB NOT NULL DEFAULT '[]',   -- [{ "label": "Oat milk", "extra": 30 }]
  tags           TEXT[] NOT NULL DEFAULT '{}',
  low_waste_note TEXT,
  batch_note     TEXT,
  batch_left     INTEGER,
  available      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  id             SERIAL PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  fulfilment     TEXT NOT NULL CHECK (fulfilment IN ('pickup', 'delivery')),
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  address        TEXT,
  subtotal       INTEGER NOT NULL,
  coupon_code    TEXT,
  discount       INTEGER NOT NULL DEFAULT 0,
  tax            INTEGER NOT NULL,
  contribution   INTEGER NOT NULL DEFAULT 0,
  total          INTEGER NOT NULL,
  payment_method TEXT NOT NULL,              -- demo only; nothing is charged
  status         TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_created_idx ON orders(created_at);

CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id),
  name         TEXT NOT NULL,
  size         TEXT,
  addons       TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   INTEGER NOT NULL,
  line_total   INTEGER NOT NULL
);

CREATE TABLE contributions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  order_id   INTEGER REFERENCES orders(id),
  amount     INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rescue_listings (
  id             SERIAL PRIMARY KEY,
  item           TEXT NOT NULL,
  category       TEXT NOT NULL,
  portions       INTEGER NOT NULL CHECK (portions > 0),
  kg_per_portion NUMERIC(4,2) NOT NULL,
  veg            BOOLEAN NOT NULL,
  dietary        TEXT[] NOT NULL DEFAULT '{}',
  prepared_note  TEXT,
  location       TEXT NOT NULL,
  pickup_start   TIMESTAMPTZ NOT NULL,
  pickup_end     TIMESTAMPTZ NOT NULL,
  best_before    TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'collected', 'withdrawn')),
  partner_id     TEXT REFERENCES partners(id),
  created_by     INTEGER REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (pickup_end > pickup_start)
);
CREATE INDEX rescue_status_idx ON rescue_listings(status);

-- One pickup per reservation. A released reservation is kept as 'cancelled' for the record.
CREATE TABLE pickups (
  id           SERIAL PRIMARY KEY,
  listing_id   INTEGER NOT NULL REFERENCES rescue_listings(id),
  partner_id   TEXT NOT NULL REFERENCES partners(id),
  portions     INTEGER NOT NULL,
  kg           NUMERIC(6,2) NOT NULL,
  status       TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'completed', 'cancelled')),
  match_score  INTEGER,                      -- score shown when it was assigned, if any
  reserved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX one_active_pickup_per_listing ON pickups(listing_id) WHERE status <> 'cancelled';

CREATE TABLE demand_history (
  date     DATE NOT NULL,
  category TEXT NOT NULL,
  sold     INTEGER NOT NULL,
  prepared INTEGER,                          -- NULL for made-to-order categories (coffee)
  PRIMARY KEY (date, category)
);

CREATE TABLE forecasts (
  id               SERIAL PRIMARY KEY,
  target_date      DATE NOT NULL,
  category         TEXT NOT NULL,
  predicted        INTEGER NOT NULL,
  low              INTEGER NOT NULL,
  high             INTEGER NOT NULL,
  recommended_prep INTEGER,
  usual_prep       INTEGER,
  confidence       TEXT NOT NULL,
  explanation      TEXT NOT NULL,
  inputs           JSONB NOT NULL,           -- the exact numbers used, so a result can be reproduced
  method           TEXT NOT NULL,
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_date, category)
);

-- Append-only log. Rescue impact totals are summed from 'pickup_completed' rows,
-- and the activity feeds read from here, so the two can't disagree.
CREATE TABLE impact_events (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('forecast_generated', 'listing_created', 'listing_updated', 'pickup_reserved',
                                           'pickup_released', 'pickup_completed', 'contribution', 'note')),
  listing_id INTEGER REFERENCES rescue_listings(id),
  partner_id TEXT REFERENCES partners(id),
  portions   INTEGER,
  kg         NUMERIC(6,2),
  amount     INTEGER,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX impact_events_created_idx ON impact_events(created_at);
