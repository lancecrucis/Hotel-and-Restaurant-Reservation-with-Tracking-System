
-- Creates the first version of the project database.
-- Run this file before running the seed file.
-- The transaction prevents a partially-created schema if a statement fails.
--
-- pgAdmin 4 instructions:
-- 1. Select the hotel_restaurant database.
-- 2. Open Tools > Query Tool.
-- 3. Select Open File and choose this SQL file.
-- 4. Select Execute Script or press F5.
BEGIN;

-- Stores customer and administrator accounts.
CREATE TABLE IF NOT EXISTS users (

    -- PostgreSQL generates identity IDs automatically.
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- New registrations should always use the default customer role.
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    email VARCHAR(255) NOT NULL,

    -- Store a bcrypt/Argon2 hash here, never a plain-text password.
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- CHECK constraints reject invalid data before it reaches the table.
    CONSTRAINT users_role_check
        CHECK (role IN ('customer', 'admin')),
    CONSTRAINT users_email_not_blank_check
        CHECK (BTRIM(email) <> ''),
    CONSTRAINT users_first_name_not_blank_check
        CHECK (BTRIM(first_name) <> ''),
    CONSTRAINT users_last_name_not_blank_check
        CHECK (BTRIM(last_name) <> '')
);

-- Treat differently-cased versions of the same email as duplicates.
-- For example, User@email.com and user@email.com cannot both register.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
    ON users (LOWER(email));

-- Automatically refresh users.updated_at whenever a user row changes.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Stores the rooms displayed on the hotel screen.
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    capacity SMALLINT NOT NULL,
    bed_type VARCHAR(50) NOT NULL,
    bed_count SMALLINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    image_url TEXT,
    has_wifi BOOLEAN NOT NULL DEFAULT FALSE,
    breakfast_included BOOLEAN NOT NULL DEFAULT FALSE,

    -- PostgreSQL TEXT[] stores amenities as a list of strings.
    special_amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT rooms_room_number_not_blank_check
        CHECK (BTRIM(room_number) <> ''),
    CONSTRAINT rooms_room_type_not_blank_check
        CHECK (BTRIM(room_type) <> ''),
    CONSTRAINT rooms_price_check
        CHECK (price_per_night >= 0),
    CONSTRAINT rooms_capacity_check
        CHECK (capacity > 0),
    CONSTRAINT rooms_bed_count_check
        CHECK (bed_count > 0),
    CONSTRAINT rooms_status_check
        CHECK (status IN ('available', 'maintenance', 'inactive'))
);

-- Helps searches such as "available rooms for at least four guests".
CREATE INDEX IF NOT EXISTS rooms_status_capacity_index
    ON rooms (status, capacity);

-- Stores the tables displayed on the restaurant screen.
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity SMALLINT NOT NULL,
    table_shape VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',

    CONSTRAINT restaurant_tables_number_not_blank_check
        CHECK (BTRIM(table_number) <> ''),
    CONSTRAINT restaurant_tables_capacity_check
        CHECK (capacity > 0),
    CONSTRAINT restaurant_tables_shape_not_blank_check
        CHECK (BTRIM(table_shape) <> ''),
    CONSTRAINT restaurant_tables_status_check
        CHECK (status IN ('available', 'maintenance', 'inactive'))
);

-- Helps searches such as "available tables for at least four guests".
CREATE INDEX IF NOT EXISTS restaurant_tables_status_capacity_index
    ON restaurant_tables (status, capacity);

-- Save every schema change made inside this transaction.
COMMIT;

-- Show the project tables after the migration finishes.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
