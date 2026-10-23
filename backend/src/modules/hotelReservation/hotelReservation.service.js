/*
Hotel Reservation Service

This file creates, lists, and cancels hotel bookings.
Creation uses a database transaction and a room-specific advisory lock so
two requests cannot reserve the same room for overlapping dates.
*/

const crypto = require("crypto");

const { pool, query } = require("../../config/database");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function createReservationReference() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `HTL-${datePart}-${randomPart}`;
}

function createPaymentReference() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `PAY-${datePart}-${randomPart}`;
}

function mapHotelReservation(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    reservationType: row.reservation_type,
    status: row.status,
    totalAmount: Number(row.total_amount),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason,
    reservationReference: row.reservation_reference,
    holdExpiresAt: row.hold_expires_at,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guestCount: row.guest_count,
    pricePerNight: Number(row.price_per_night),
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at,
    specialRequests: row.special_requests,
    room: {
      id: Number(row.room_id),
      roomNumber: row.room_number,
      roomType: row.room_type,
      imageUrl: row.image_url,
    },
    payment: row.payment_id
      ? {
          id: Number(row.payment_id),
          amount: Number(row.payment_amount),
          method: row.payment_method,
          status: row.payment_status,
          transactionReference: row.transaction_reference,
          paidAt: row.paid_at,
        }
      : null,
  };
}

const reservationSelect = `
  SELECT
    r.id,
    r.user_id,
    r.reservation_type,
    r.status,
    r.total_amount,
    r.contact_name,
    r.contact_email,
    r.contact_phone,
    r.created_at,
    r.updated_at,
    r.cancelled_at,
    r.cancellation_reason,
    r.reservation_reference,
    r.hold_expires_at,
    hr.room_id,
    hr.check_in,
    hr.check_out,
    hr.guest_count,
    hr.price_per_night,
    hr.checked_in_at,
    hr.checked_out_at,
    hr.special_requests,
    rm.room_number,
    rm.room_type,
    rm.image_url,
    payment.id AS payment_id,
    payment.amount AS payment_amount,
    payment.payment_method,
    payment.payment_status,
    payment.transaction_reference,
    payment.paid_at
  FROM reservations AS r
  INNER JOIN hotel_reservations AS hr
    ON hr.reservation_id = r.id
  INNER JOIN rooms AS rm
    ON rm.id = hr.room_id
  LEFT JOIN LATERAL (
    SELECT
      p.id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.transaction_reference,
      p.paid_at
    FROM payments AS p
    WHERE p.reservation_id = r.id
    ORDER BY p.created_at DESC
    LIMIT 1
  ) AS payment ON TRUE
`;

async function getHotelReservationById(reservationId, userId) {
  const result = await query(
    `${reservationSelect}
     WHERE r.id = $1
       AND r.user_id = $2`,
    [reservationId, userId],
  );

  if (result.rowCount === 0) {
    throw createError("Hotel reservation not found.", 404);
  }

  return mapHotelReservation(result.rows[0]);
}

async function createHotelReservation(userId, input) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Only one booking transaction can check this room at a time.
    await client.query(
      "SELECT pg_advisory_xact_lock($1::bigint)",
      [input.roomId],
    );

    const roomResult = await client.query(
      `
        SELECT id, room_number, capacity, price_per_night, status
        FROM rooms
        WHERE id = $1
        FOR UPDATE
      `,
      [input.roomId],
    );

    if (roomResult.rowCount === 0) {
      throw createError("Room not found.", 404);
    }

    const room = roomResult.rows[0];

    if (room.status !== "available") {
      throw createError("This room is not available for booking.", 409);
    }

    if (input.guestCount > room.capacity) {
      throw createError(
        `This room allows a maximum of ${room.capacity} guests.`,
        400,
      );
    }

    const overlapResult = await client.query(
      `
        SELECT 1
        FROM hotel_reservations AS hr
        INNER JOIN reservations AS r
          ON r.id = hr.reservation_id
        WHERE hr.room_id = $1
          AND hr.check_in < $3::date
          AND hr.check_out > $2::date
          AND (
            r.status = 'confirmed'
            OR (
              r.status = 'pending'
              AND (
                r.hold_expires_at IS NULL
                OR r.hold_expires_at > CURRENT_TIMESTAMP
              )
            )
          )
        LIMIT 1
      `,
      [input.roomId, input.checkIn, input.checkOut],
    );

    if (overlapResult.rowCount > 0) {
      throw createError(
        "This room is already reserved for the selected dates.",
        409,
      );
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const nights =
      (new Date(`${input.checkOut}T00:00:00Z`) -
        new Date(`${input.checkIn}T00:00:00Z`)) /
      millisecondsPerDay;
    const pricePerNight = Number(room.price_per_night);
    const totalAmount = (pricePerNight * nights).toFixed(2);
    const reservationReference = createReservationReference();

    const reservationResult = await client.query(
      `
        INSERT INTO reservations (
          user_id,
          reservation_type,
          status,
          total_amount,
          contact_name,
          contact_email,
          contact_phone,
          reservation_reference
        )
        VALUES ($1, 'hotel', 'confirmed', $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        userId,
        totalAmount,
        input.contactName.trim(),
        input.contactEmail.trim().toLowerCase(),
        input.contactPhone.trim(),
        reservationReference,
      ],
    );

    const reservationId = Number(reservationResult.rows[0].id);

    await client.query(
      `
        INSERT INTO hotel_reservations (
          reservation_id,
          room_id,
          check_in,
          check_out,
          guest_count,
          price_per_night,
          special_requests
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        reservationId,
        input.roomId,
        input.checkIn,
        input.checkOut,
        input.guestCount,
        pricePerNight,
        input.specialRequests?.trim() || null,
      ],
    );

    // Payment is saved in the same transaction as the reservation so the
    // database never receives one record without the other.
    await client.query(
      `
        INSERT INTO payments (
          reservation_id,
          amount,
          payment_method,
          payment_status,
          transaction_reference
        )
        VALUES ($1, $2, $3, 'pending', $4)
      `,
      [
        reservationId,
        totalAmount,
        input.paymentMethod || "pay_at_hotel",
        createPaymentReference(),
      ],
    );

    await client.query("COMMIT");

    return getHotelReservationById(reservationId, userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getMyHotelReservations(userId) {
  const result = await query(
    `${reservationSelect}
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );

  return result.rows.map(mapHotelReservation);
}

async function cancelHotelReservation(userId, reservationId, reason) {
  const result = await query(
    `
      UPDATE reservations
      SET
        status = 'cancelled',
        cancelled_at = CURRENT_TIMESTAMP,
        cancellation_reason = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND user_id = $2
        AND reservation_type = 'hotel'
        AND status IN ('pending', 'confirmed')
      RETURNING id
    `,
    [reservationId, userId, reason?.trim() || "Cancelled by customer."],
  );

  if (result.rowCount === 0) {
    const existing = await query(
      `
        SELECT status
        FROM reservations
        WHERE id = $1
          AND user_id = $2
          AND reservation_type = 'hotel'
      `,
      [reservationId, userId],
    );

    if (existing.rowCount === 0) {
      throw createError("Hotel reservation not found.", 404);
    }

    throw createError(
      `A ${existing.rows[0].status} reservation cannot be cancelled.`,
      409,
    );
  }

  return getHotelReservationById(reservationId, userId);
}

module.exports = {
  createHotelReservation,
  getMyHotelReservations,
  cancelHotelReservation,
};
