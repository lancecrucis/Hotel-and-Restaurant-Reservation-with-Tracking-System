
-- Adds sample data so the hotel and restaurant screens have records to show.
-- Run database/migrations/001_initial_schema.sql before this file.
-- This file is optional when empty tables are preferred.
--
-- pgAdmin 4 instructions:
-- 1. Select the hotel_restaurant database.
-- 2. Open Tools > Query Tool.
-- 3. Select Open File and choose this SQL file.
-- 4. Select Execute Script or press F5.
BEGIN;

-- Sample hotel rooms. No users are seeded because passwords require secure hashes.
INSERT INTO rooms (
    room_number,
    room_type,
    description,
    price_per_night,
    capacity,
    bed_type,
    bed_count,
    status,
    image_url,
    has_wifi,
    breakfast_included,
    special_amenities
)
VALUES
    ('101', 'Standard', 'Comfortable room for one or two guests.', 2500.00, 2, 'Queen', 1, 'available', NULL, TRUE, FALSE, ARRAY['Air conditioning', 'Television']),
    ('102', 'Standard Twin', 'Twin-bed room suitable for friends or coworkers.', 2800.00, 2, 'Single', 2, 'available', NULL, TRUE, FALSE, ARRAY['Air conditioning', 'Television', 'Desk']),
    ('201', 'Deluxe', 'Spacious room with a seating area and city view.', 4200.00, 3, 'King', 1, 'available', NULL, TRUE, TRUE, ARRAY['Air conditioning', 'Television', 'Mini refrigerator', 'City view']),
    ('202', 'Deluxe Twin', 'Large room with two beds and complimentary breakfast.', 4500.00, 4, 'Double', 2, 'available', NULL, TRUE, TRUE, ARRAY['Air conditioning', 'Television', 'Mini refrigerator']),
    ('301', 'Family Suite', 'Family suite with additional living space.', 6500.00, 6, 'Mixed', 3, 'available', NULL, TRUE, TRUE, ARRAY['Air conditioning', 'Television', 'Living area', 'Kitchenette']),
    ('302', 'Executive Suite', 'Premium suite intended for business and leisure stays.', 7500.00, 4, 'King', 1, 'maintenance', NULL, TRUE, TRUE, ARRAY['Air conditioning', 'Smart television', 'Living area', 'Work desk'])

-- This makes the seed reusable: matching room numbers are updated, not duplicated.
ON CONFLICT (room_number) DO UPDATE SET
    room_type = EXCLUDED.room_type,
    description = EXCLUDED.description,
    price_per_night = EXCLUDED.price_per_night,
    capacity = EXCLUDED.capacity,
    bed_type = EXCLUDED.bed_type,
    bed_count = EXCLUDED.bed_count,
    status = EXCLUDED.status,
    image_url = EXCLUDED.image_url,
    has_wifi = EXCLUDED.has_wifi,
    breakfast_included = EXCLUDED.breakfast_included,
    special_amenities = EXCLUDED.special_amenities;

-- Five sample restaurant tables for the prototype screen.
INSERT INTO restaurant_tables (
    table_number,
    capacity,
    table_shape,
    status
)
VALUES
    ('T01', 2, 'Round', 'available'),
    ('T02', 2, 'Square', 'available'),
    ('T03', 4, 'Round', 'available'),
    ('T04', 4, 'Rectangle', 'available'),
    ('T05', 6, 'Rectangle', 'available')

-- This makes the seed reusable: matching table numbers are updated, not duplicated.
ON CONFLICT (table_number) DO UPDATE SET
    capacity = EXCLUDED.capacity,
    table_shape = EXCLUDED.table_shape,
    status = EXCLUDED.status;

-- Save all inserted or updated sample data.
COMMIT;

-- Show how many sample records are now available.
SELECT 'rooms' AS table_name, COUNT(*) AS row_count
FROM rooms
UNION ALL
SELECT 'restaurant_tables' AS table_name, COUNT(*) AS row_count
FROM restaurant_tables;
