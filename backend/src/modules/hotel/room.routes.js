/*
Room Routes

This file connects each room URL to its controller function.

The /available route must come before /:roomId so Express does not
mistake the word "available" for a room ID.
*/

const express = require("express");

const {
  listRooms,
  searchAvailableRooms,
  getRoomDetails,
} = require("./room.controller");

const router = express.Router();

// Get every room.
router.get("/", listRooms);

// Search available rooms using dates and guest count.
router.get("/available", searchAvailableRooms);

// Get one room using its ID.
router.get("/:roomId", getRoomDetails);

module.exports = router;