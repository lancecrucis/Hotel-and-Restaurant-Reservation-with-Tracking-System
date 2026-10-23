-- Adds the shared reservation record and hotel-specific booking details.
-- Run this after 001_initial_schema.sql.
-- Restaurant reservation details will be added in a later migration.
BEGIN;

-- Stores information shared by every reservation type.
CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reservation_type VARCHAR(20) NOT NULL DEFAULT 'hotel',
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    total_amount NUMERIC(12, 2) NOT NULL,
    contact_name VARCHAR(101) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    reservation_reference VARCHAR(30) NOT NULL UNIQUE,
    hold_expires_at TIMESTAMPTZ,

    CONSTRAINT reservations_type_check
        CHECK (reservation_type IN ('hotel', 'restaurant')),
    CONSTRAINT reservations_status_check
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    CONSTRAINT reservations_total_amount_check
        CHECK (total_amount >= 0)
);

-- Stores fields that only apply to hotel room reservations.
CREATE TABLE IF NOT EXISTS hotel_reservations (
    reservation_id BIGINT PRIMARY KEY
        REFERENCES reservations(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count SMALLINT NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    special_requests TEXT,

    CONSTRAINT hotel_reservations_dates_check
        CHECK (check_out > check_in),
    CONSTRAINT hotel_reservations_guest_count_check
        CHECK (guest_count > 0),
    CONSTRAINT hotel_reservations_price_check
        CHECK (price_per_night >= 0)
);

-- Speeds up availability checks for one room and date range.
CREATE INDEX IF NOT EXISTS hotel_reservations_room_dates_index
    ON hotel_reservations (room_id, check_in, check_out);

-- Speeds up the "My Reservations" query.
CREATE INDEX IF NOT EXISTS reservations_user_created_index
    ON reservations (user_id, created_at DESC);

COMMIT;

-- Display the two new tables after the migration finishes.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('reservations', 'hotel_reservations')
ORDER BY table_name;
