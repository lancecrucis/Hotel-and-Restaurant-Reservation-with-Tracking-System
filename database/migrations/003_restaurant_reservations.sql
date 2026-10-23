-- Adds restaurant-specific reservation details.
-- Run this after 002_hotel_reservations.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS restaurant_reservations (
    reservation_id BIGINT PRIMARY KEY
        REFERENCES reservations(id) ON DELETE CASCADE,
    table_id BIGINT NOT NULL
        REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count SMALLINT NOT NULL,
    special_requests TEXT,
    arrived_at TIMESTAMPTZ,
    seated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    CONSTRAINT restaurant_reservations_time_check
        CHECK (end_time > start_time),
    CONSTRAINT restaurant_reservations_guest_count_check
        CHECK (guest_count > 0)
);

-- Speeds up availability checks for one table, date, and time range.
CREATE INDEX IF NOT EXISTS restaurant_reservations_table_schedule_index
    ON restaurant_reservations (
        table_id,
        reservation_date,
        start_time,
        end_time
    );

COMMIT;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'restaurant_reservations';
