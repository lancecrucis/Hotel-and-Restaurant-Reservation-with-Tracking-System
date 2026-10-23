
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

    -- New registrations should always use the default user role.
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    email VARCHAR(100) NOT NULL,

    -- Store a bcrypt/Argon2 hash here, never a plain-text password.
    password_hash VARCHAR(128) NOT NULL,
    phone_number VARCHAR(11),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Only regular users and administrators are valid roles.
    CONSTRAINT users_role_check
        CHECK (role IN ('user', 'admin'))
);

-- Treat differently-cased versions of the same email as duplicates.
-- For example, User@email.com and user@email.com cannot both register.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
    ON users (LOWER(email));

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

    CONSTRAINT rooms_price_check
        CHECK (price_per_night >= 0),
    CONSTRAINT rooms_capacity_check
        CHECK (capacity > 0),
    CONSTRAINT rooms_bed_count_check
        CHECK (bed_count > 0),
    CONSTRAINT rooms_status_check
        CHECK (status IN ('available', 'maintenance', 'inactive'))
);

-- Stores the tables displayed on the restaurant screen.
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity SMALLINT NOT NULL,
    table_shape VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',

    CONSTRAINT restaurant_tables_capacity_check
        CHECK (capacity > 0),
    CONSTRAINT restaurant_tables_status_check
        CHECK (status IN ('available', 'maintenance', 'inactive'))
);

-- Save every schema change made inside this transaction.
COMMIT;

-- Show the project tables after the migration finishes.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
