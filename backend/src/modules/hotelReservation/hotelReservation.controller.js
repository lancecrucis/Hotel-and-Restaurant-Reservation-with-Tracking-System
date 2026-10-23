/*
Hotel Reservation Controller

This file validates booking requests and sends consistent JSON responses.
Database calculations and overlap checks stay in the service file.
*/

const {
  createHotelReservation,
  getMyHotelReservations,
  cancelHotelReservation,
} = require("./hotelReservation.service");

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createReservation(request, response, next) {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guestCount,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      paymentMethod,
    } = request.body || {};

    if (!Number.isInteger(roomId) || roomId < 1) {
      throw validationError("roomId must be a positive whole number.");
    }

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      throw validationError(
        "checkIn and checkOut must use the YYYY-MM-DD format.",
      );
    }

    if (checkOut <= checkIn) {
      throw validationError("Check-out date must be after check-in date.");
    }

    const today = new Date().toISOString().slice(0, 10);

    if (checkIn < today) {
      throw validationError("Check-in date cannot be in the past.");
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

    const allowedPaymentMethods = [
      "pay_at_hotel",
      "credit_card",
      "gcash",
    ];

    if (
      paymentMethod !== undefined &&
      !allowedPaymentMethods.includes(paymentMethod)
    ) {
      throw validationError(
        "paymentMethod must be pay_at_hotel, credit_card, or gcash.",
      );
    }

    const reservation = await createHotelReservation(request.user.id, {
      roomId,
      checkIn,
      checkOut,
      guestCount,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      paymentMethod: paymentMethod || "pay_at_hotel",
    });

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
    const reservations = await getMyHotelReservations(request.user.id);

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

    const reservation = await cancelHotelReservation(
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
