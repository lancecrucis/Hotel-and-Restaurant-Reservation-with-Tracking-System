-- Adds automatic reservation status history and user notifications.
-- Run this after 003_restaurant_reservations.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS reservation_status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT NOT NULL
        REFERENCES reservations(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT reservation_history_previous_status_check
        CHECK (
            previous_status IS NULL
            OR previous_status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        ),
    CONSTRAINT reservation_history_new_status_check
        CHECK (
            new_status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        )
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reservation_id BIGINT REFERENCES reservations(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reservation_history_reservation_index
    ON reservation_status_history (reservation_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_created_index
    ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_index
    ON notifications (user_id, is_read)
    WHERE is_read = FALSE;

-- Record every initial status and later status change, then notify the owner.
CREATE OR REPLACE FUNCTION record_reservation_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    notification_title VARCHAR(150);
    notification_message TEXT;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    INSERT INTO reservation_status_history (
        reservation_id,
        previous_status,
        new_status
    )
    VALUES (
        NEW.id,
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
        NEW.status
    );

    notification_title := CASE NEW.status
        WHEN 'pending' THEN 'Reservation pending'
        WHEN 'confirmed' THEN 'Reservation confirmed'
        WHEN 'cancelled' THEN 'Reservation cancelled'
        WHEN 'completed' THEN 'Reservation completed'
    END;

    notification_message := format(
        'Your %s reservation %s is now %s.',
        NEW.reservation_type,
        NEW.reservation_reference,
        NEW.status
    );

    INSERT INTO notifications (
        user_id,
        reservation_id,
        title,
        message
    )
    VALUES (
        NEW.user_id,
        NEW.id,
        notification_title,
        notification_message
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservations_status_change_trigger ON reservations;

CREATE TRIGGER reservations_status_change_trigger
AFTER INSERT OR UPDATE OF status ON reservations
FOR EACH ROW
EXECUTE FUNCTION record_reservation_status_change();

-- Give existing reservations one initial history entry.
INSERT INTO reservation_status_history (
    reservation_id,
    previous_status,
    new_status,
    changed_at
)
SELECT
    r.id,
    NULL,
    r.status,
    r.created_at
FROM reservations AS r
WHERE NOT EXISTS (
    SELECT 1
    FROM reservation_status_history AS history
    WHERE history.reservation_id = r.id
);

-- Give existing reservation owners one initial notification.
INSERT INTO notifications (
    user_id,
    reservation_id,
    title,
    message,
    created_at
)
SELECT
    r.user_id,
    r.id,
    CASE r.status
        WHEN 'pending' THEN 'Reservation pending'
        WHEN 'confirmed' THEN 'Reservation confirmed'
        WHEN 'cancelled' THEN 'Reservation cancelled'
        WHEN 'completed' THEN 'Reservation completed'
    END,
    format(
        'Your %s reservation %s is now %s.',
        r.reservation_type,
        r.reservation_reference,
        r.status
    ),
    r.created_at
FROM reservations AS r
WHERE NOT EXISTS (
    SELECT 1
    FROM notifications AS notification
    WHERE notification.reservation_id = r.id
);

COMMIT;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'notifications',
      'reservation_status_history'
  )
ORDER BY table_name;
