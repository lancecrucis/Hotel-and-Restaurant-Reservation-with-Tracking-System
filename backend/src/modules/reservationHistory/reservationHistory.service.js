/* Returns reservation status changes belonging to the logged-in user. */

const { query } = require("../../config/database");

async function getMyReservationHistory(userId) {
  const result = await query(
    `
      SELECT
        history.id,
        history.reservation_id,
        history.previous_status,
        history.new_status,
        history.changed_at,
        reservation.reservation_type,
        reservation.reservation_reference
      FROM reservation_status_history AS history
      INNER JOIN reservations AS reservation
        ON reservation.id = history.reservation_id
      WHERE reservation.user_id = $1
      ORDER BY history.changed_at DESC, history.id DESC
    `,
    [userId],
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    reservationId: Number(row.reservation_id),
    reservationType: row.reservation_type,
    reservationReference: row.reservation_reference,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    changedAt: row.changed_at,
  }));
}

module.exports = {
  getMyReservationHistory,
};
