BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
    ON users (LOWER(email));

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

CREATE INDEX IF NOT EXISTS rooms_status_capacity_index
    ON rooms (status, capacity);

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

CREATE INDEX IF NOT EXISTS restaurant_tables_status_capacity_index
    ON restaurant_tables (status, capacity);

COMMIT;
