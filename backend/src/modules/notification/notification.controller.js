/* Validates notification requests and returns JSON responses. */

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("./notification.service");

async function listNotifications(request, response, next) {
  try {
    const notifications = await getNotifications(request.user.id);

    response.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(request, response, next) {
  try {
    const notificationId = Number(request.params.notificationId);

    if (!Number.isInteger(notificationId) || notificationId < 1) {
      const error = new Error(
        "notificationId must be a positive whole number.",
      );
      error.statusCode = 400;
      throw error;
    }

    const notification = await markNotificationAsRead(
      request.user.id,
      notificationId,
    );

    response.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(request, response, next) {
  try {
    const notifications = await markAllNotificationsAsRead(
      request.user.id,
    );

    response.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
