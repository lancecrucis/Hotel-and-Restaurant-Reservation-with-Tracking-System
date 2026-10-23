/*
Restaurant Reservation Controller

This file validates restaurant booking requests. Every reservation uses a
fixed two-hour time slot for the current prototype.
*/

const getRestaurantEndTime = require("./timeSlot");
const {
  createRestaurantReservation,
  getMyRestaurantReservations,
  cancelRestaurantReservation,
} = require("./restaurantReservation.service");

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createReservation(request, response, next) {
  try {
    const {
      tableId,
      reservationDate,
      startTime,
      guestCount,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
    } = request.body || {};

    if (!Number.isInteger(tableId) || tableId < 1) {
      throw validationError("tableId must be a positive whole number.");
    }

    if (!isValidDate(reservationDate)) {
      throw validationError(
        "reservationDate must use the YYYY-MM-DD format.",
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    if (reservationDate < today) {
      throw validationError("Reservation date cannot be in the past.");
    }

    if (!isValidTime(startTime)) {
      throw validationError("startTime must use the HH:MM format.");
    }

    const endTime = getRestaurantEndTime(startTime);

    if (!endTime) {
      throw validationError(
        "Start time must be no later than 21:59 for a two-hour reservation.",
      );
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      throw validationError("guestCount must be a positive whole number.");
    }

    if (
      typeof contactName !== "string" ||
      !contactName.trim() ||
      contactName.trim().length > 101
    ) {
      throw validationError(
        "Contact name is required and cannot exceed 101 characters.",
      );
    }

    if (
      typeof contactEmail !== "string" ||
      contactEmail.trim().length > 100 ||
      !isValidEmail(contactEmail.trim())
    ) {
      throw validationError("A valid contact email is required.");
    }

    if (
      typeof contactPhone !== "string" ||
      !/^\d{11}$/.test(contactPhone.trim())
    ) {
      throw validationError("Contact phone must contain exactly 11 digits.");
    }

    if (
      specialRequests !== undefined &&
      (typeof specialRequests !== "string" ||
        specialRequests.length > 1000)
    ) {
      throw validationError(
        "Special requests cannot exceed 1000 characters.",
      );
    }

    const reservation = await createRestaurantReservation(
      request.user.id,
      {
        tableId,
        reservationDate,
        startTime,
        endTime,
        guestCount,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests,
      },
    );

    response.status(201).json({
      success: true,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
}

async function listMyReservations(request, response, next) {
  try {
    const reservations = await getMyRestaurantReservations(request.user.id);

    response.status(200).json({
      success: true,
      data: { reservations },
    });
  } catch (error) {
    next(error);
  }
}

async function cancelReservation(request, response, next) {
  try {
    const reservationId = Number(request.params.reservationId);
    const { reason } = request.body || {};

    if (!Number.isInteger(reservationId) || reservationId < 1) {
      throw validationError(
        "reservationId must be a positive whole number.",
      );
    }

    if (
      reason !== undefined &&
      (typeof reason !== "string" || reason.length > 500)
    ) {
      throw validationError(
        "Cancellation reason cannot exceed 500 characters.",
      );
    }

    const reservation = await cancelRestaurantReservation(
      request.user.id,
      reservationId,
      reason,
    );

    response.status(200).json({
      success: true,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReservation,
  listMyReservations,
  cancelReservation,
};
