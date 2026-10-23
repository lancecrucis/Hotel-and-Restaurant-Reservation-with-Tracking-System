-- Adds payment records connected to hotel and restaurant reservations.
-- Run this after 004_reservation_history_and_notifications.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT NOT NULL
        REFERENCES reservations(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(40) NOT NULL UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT payments_amount_check
        CHECK (amount >= 0),
    CONSTRAINT payments_method_check
        CHECK (
            payment_method IN (
                'pay_at_hotel',
                'credit_card',
                'gcash'
            )
        ),
    CONSTRAINT payments_status_check
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        )
);

-- Makes payment lookups for one reservation fast.
CREATE INDEX IF NOT EXISTS payments_reservation_created_index
    ON payments (reservation_id, created_at DESC);

COMMIT;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'payments';
