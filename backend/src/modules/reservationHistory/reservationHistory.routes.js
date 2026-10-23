const express = require("express");

const authenticate = require("../../middleware/authenticate");
const {
  listMyReservationHistory,
} = require("./reservationHistory.controller");

const router = express.Router();

router.use(authenticate);
router.get("/me", listMyReservationHistory);

module.exports = router;
