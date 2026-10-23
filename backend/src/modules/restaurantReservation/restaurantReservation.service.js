/*
Restaurant Reservation Service

This file creates, lists, and cancels restaurant reservations. A transaction
and table-specific advisory lock prevent simultaneous overlapping bookings.
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

  return `RST-${datePart}-${randomPart}`;
}

function mapRestaurantReservation(row) {
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
    reservationDate: row.reservation_date,
    startTime: row.start_time,
    endTime: row.end_time,
    guestCount: row.guest_count,
    specialRequests: row.special_requests,
    arrivedAt: row.arrived_at,
    seatedAt: row.seated_at,
    completedAt: row.completed_at,
    table: {
      id: Number(row.table_id),
      tableNumber: row.table_number,
      capacity: row.capacity,
      tableShape: row.table_shape,
    },
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
    rr.table_id,
    rr.reservation_date,
    rr.start_time,
    rr.end_time,
    rr.guest_count,
    rr.special_requests,
    rr.arrived_at,
    rr.seated_at,
    rr.completed_at,
    rt.table_number,
    rt.capacity,
    rt.table_shape
  FROM reservations AS r
  INNER JOIN restaurant_reservations AS rr
    ON rr.reservation_id = r.id
  INNER JOIN restaurant_tables AS rt
    ON rt.id = rr.table_id
`;

async function getRestaurantReservationById(reservationId, userId) {
  const result = await query(
    `${reservationSelect}
     WHERE r.id = $1
       AND r.user_id = $2`,
    [reservationId, userId],
  );

  if (result.rowCount === 0) {
    throw createError("Restaurant reservation not found.", 404);
  }

  return mapRestaurantReservation(result.rows[0]);
}

async function createRestaurantReservation(userId, input) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // The first lock key identifies restaurant tables in this application.
    await client.query(
      "SELECT pg_advisory_xact_lock(2, $1::integer)",
      [input.tableId],
    );

    const tableResult = await client.query(
      `
        SELECT id, table_number, capacity, table_shape, status
        FROM restaurant_tables
        WHERE id = $1
        FOR UPDATE
      `,
      [input.tableId],
    );

    if (tableResult.rowCount === 0) {
      throw createError("Restaurant table not found.", 404);
    }

    const table = tableResult.rows[0];

    if (table.status !== "available") {
      throw createError(
        "This restaurant table is not available for booking.",
        409,
      );
    }

    if (input.guestCount > table.capacity) {
      throw createError(
        `This table allows a maximum of ${table.capacity} guests.`,
        400,
      );
    }

    const overlapResult = await client.query(
      `
        SELECT 1
        FROM restaurant_reservations AS rr
        INNER JOIN reservations AS r
          ON r.id = rr.reservation_id
        WHERE rr.table_id = $1
          AND rr.reservation_date = $2::date
          AND rr.start_time < $4::time
          AND rr.end_time > $3::time
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
      [
        input.tableId,
        input.reservationDate,
        input.startTime,
        input.endTime,
      ],
    );

    if (overlapResult.rowCount > 0) {
      throw createError(
        "This table is already reserved for the selected time.",
        409,
      );
    }

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
        VALUES ($1, 'restaurant', 'confirmed', 0, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        userId,
        input.contactName.trim(),
        input.contactEmail.trim().toLowerCase(),
        input.contactPhone.trim(),
        createReservationReference(),
      ],
    );

    const reservationId = Number(reservationResult.rows[0].id);

    await client.query(
      `
        INSERT INTO restaurant_reservations (
          reservation_id,
          table_id,
          reservation_date,
          start_time,
          end_time,
          guest_count,
          special_requests
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        reservationId,
        input.tableId,
        input.reservationDate,
        input.startTime,
        input.endTime,
        input.guestCount,
        input.specialRequests?.trim() || null,
      ],
    );

    await client.query("COMMIT");

    return getRestaurantReservationById(reservationId, userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getMyRestaurantReservations(userId) {
  const result = await query(
    `${reservationSelect}
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );

  return result.rows.map(mapRestaurantReservation);
}

async function cancelRestaurantReservation(userId, reservationId, reason) {
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
        AND reservation_type = 'restaurant'
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
          AND reservation_type = 'restaurant'
      `,
      [reservationId, userId],
    );

    if (existing.rowCount === 0) {
      throw createError("Restaurant reservation not found.", 404);
    }

    throw createError(
      `A ${existing.rows[0].status} reservation cannot be cancelled.`,
      409,
    );
  }

  return getRestaurantReservationById(reservationId, userId);
}

module.exports = {
  createRestaurantReservation,
  getMyRestaurantReservations,
  cancelRestaurantReservation,
};
