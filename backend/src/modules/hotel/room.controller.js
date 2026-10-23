/*
Room Controller

This file handles HTTP requests and responses for hotel rooms.

Its responsibilities are:
1. Read URL parameters and search query values.
2. Validate dates, guest count, and room IDs.
3. Call room.service.js for PostgreSQL operations.
4. Return consistent JSON responses.
5. Pass errors to the global error handler.
*/

const {
  getAllRooms,
  getAvailableRooms,
  getRoomById,
} = require("./room.service");

// Create a validation error with HTTP status 400.
function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// Confirm that a value is a real YYYY-MM-DD date.
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

// GET /api/v1/rooms
async function listRooms(request, response, next) {
  try {
    const rooms = await getAllRooms();

    response.status(200).json({
      success: true,
      data: {
        rooms,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/rooms/available
async function searchAvailableRooms(request, response, next) {
  try {
    const { checkIn, checkOut, guests } = request.query;

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      throw validationError(
        "checkIn and checkOut must use the YYYY-MM-DD format.",
      );
    }

    // YYYY-MM-DD strings can be compared after their format is validated.
    if (checkOut <= checkIn) {
      throw validationError(
        "Check-out date must be after the check-in date.",
      );
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      throw validationError(
        "guests must be a positive whole number.",
      );
    }

    const rooms = await getAvailableRooms(
      checkIn,
      checkOut,
      guestCount,
    );

    response.status(200).json({
      success: true,
      data: {
        rooms,
        search: {
          checkIn,
          checkOut,
          guests: guestCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/rooms/:roomId
async function getRoomDetails(request, response, next) {
  try {
    const roomId = Number(request.params.roomId);

    if (!Number.isInteger(roomId) || roomId < 1) {
      throw validationError("roomId must be a positive whole number.");
    }

    const room = await getRoomById(roomId);

    response.status(200).json({
      success: true,
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRooms,
  searchAvailableRooms,
  getRoomDetails,
};
