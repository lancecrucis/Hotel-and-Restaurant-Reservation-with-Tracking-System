/*
Restaurant Table Routes

The /available route must come before /:tableId so Express does not treat
the word "available" as a table ID.
*/

const express = require("express");

const {
  listRestaurantTables,
  searchAvailableRestaurantTables,
  getRestaurantTableDetails,
} = require("./table.controller");

const router = express.Router();

router.get("/", listRestaurantTables);
router.get("/available", searchAvailableRestaurantTables);
router.get("/:tableId", getRestaurantTableDetails);

module.exports = router;
