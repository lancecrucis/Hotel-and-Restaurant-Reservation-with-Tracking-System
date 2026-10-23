/*
Restaurant Table Controller

This file validates request values, calls the service, and returns JSON.
Availability checks a fixed two-hour reservation slot.
*/

const getRestaurantEndTime = require(
  "../restaurantReservation/timeSlot",
);

const {
  getAllRestaurantTables,
  getAvailableRestaurantTables,
  getRestaurantTableById,
} = require("./table.service");

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function isValidTime(value) {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

async function listRestaurantTables(request, response, next) {
  try {
    const tables = await getAllRestaurantTables();
    response.status(200).json({ success: true, data: { tables } });
  } catch (error) {
    next(error);
  }
}

async function searchAvailableRestaurantTables(
  request,
  response,
  next,
) {
  try {
    const { date, time, guests } = request.query;

    if (!isValidDate(date)) {
      throw validationError("date must use the YYYY-MM-DD format.");
    }

    if (!isValidTime(time)) {
      throw validationError("time must use the HH:MM format.");
    }

    const endTime = getRestaurantEndTime(time);

    if (!endTime) {
      throw validationError(
        "time must be no later than 21:59 for a two-hour reservation.",
      );
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      throw validationError("guests must be a positive whole number.");
    }

    const tables = await getAvailableRestaurantTables(
      date,
      time,
      endTime,
      guestCount,
    );

    response.status(200).json({
      success: true,
      data: {
        tables,
        search: { date, time, endTime, guests: guestCount },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getRestaurantTableDetails(request, response, next) {
  try {
    const tableId = Number(request.params.tableId);

    if (!Number.isInteger(tableId) || tableId < 1) {
      throw validationError("tableId must be a positive whole number.");
    }

    const table = await getRestaurantTableById(tableId);
    response.status(200).json({ success: true, data: { table } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRestaurantTables,
  searchAvailableRestaurantTables,
  getRestaurantTableDetails,
};
