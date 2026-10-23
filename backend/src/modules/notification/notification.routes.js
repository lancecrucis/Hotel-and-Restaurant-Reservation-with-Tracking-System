const express = require("express");

const authenticate = require("../../middleware/authenticate");
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require("./notification.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", listNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:notificationId/read", markAsRead);

module.exports = router;
