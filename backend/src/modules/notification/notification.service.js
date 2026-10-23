/* Notification database operations for the logged-in user. */

const { query } = require("../../config/database");

function mapNotification(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    reservationId:
      row.reservation_id === null ? null : Number(row.reservation_id),
    reservationType: row.reservation_type,
    reservationReference: row.reservation_reference,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

async function getNotifications(userId) {
  const result = await query(
    `
      SELECT
        notification.id,
        notification.user_id,
        notification.reservation_id,
        notification.title,
        notification.message,
        notification.is_read,
        notification.created_at,
        reservation.reservation_type,
        reservation.reservation_reference
      FROM notifications AS notification
      LEFT JOIN reservations AS reservation
        ON reservation.id = notification.reservation_id
      WHERE notification.user_id = $1
      ORDER BY notification.created_at DESC, notification.id DESC
    `,
    [userId],
  );

  return result.rows.map(mapNotification);
}

async function markNotificationAsRead(userId, notificationId) {
  const result = await query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [notificationId, userId],
  );

  if (result.rowCount === 0) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  const notifications = await getNotifications(userId);

  return notifications.find(
    (notification) => notification.id === notificationId,
  );
}

async function markAllNotificationsAsRead(userId) {
  await query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
        AND is_read = FALSE
    `,
    [userId],
  );

  return getNotifications(userId);
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
