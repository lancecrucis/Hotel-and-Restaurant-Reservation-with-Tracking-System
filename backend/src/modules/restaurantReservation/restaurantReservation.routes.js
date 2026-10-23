/*
Restaurant Reservation Routes

Every route is protected because a reservation must belong to a user.
*/

const express = require("express");

const authenticate = require("../../middleware/authenticate");
const {
  createReservation,
  listMyReservations,
  cancelReservation,
} = require("./restaurantReservation.controller");

const router = express.Router();

router.use(authenticate);

router.post("/", createReservation);
router.get("/me", listMyReservations);
router.patch("/:reservationId/cancel", cancelReservation);

module.exports = router;
