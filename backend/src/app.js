/*
Express Application

This file configures the API middleware and connects route modules.

Middleware order is important:
1. Configure CORS.
2. Read JSON request bodies.
3. Register API routes.
4. Handle unknown routes.
5. Handle errors.
*/

const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const roomRoutes = require("./modules/hotel/room.routes");
const restaurantTableRoutes = require(
  "./modules/restaurant/table.routes",
);
const hotelReservationRoutes = require(
  "./modules/hotelReservation/hotelReservation.routes",
);
const restaurantReservationRoutes = require(
  "./modules/restaurantReservation/restaurantReservation.routes",
);
const notificationRoutes = require(
  "./modules/notification/notification.routes",
);
const reservationHistoryRoutes = require(
  "./modules/reservationHistory/reservationHistory.routes",
);
const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

// Allow the React frontend to communicate with the backend.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Convert incoming JSON request bodies into JavaScript objects.
app.use(express.json());

// Check whether the API server is running.
app.get("/api/v1/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "API is running",
  });
});

// All authentication endpoints begin with /api/v1/auth.
app.use("/api/v1/auth", authRoutes);

// All hotel room endpoints begin with /api/v1/rooms.
app.use("/api/v1/rooms", roomRoutes);

// All restaurant table endpoints begin with /api/v1/restaurant/tables.
app.use("/api/v1/restaurant/tables", restaurantTableRoutes);

// Authenticated hotel booking endpoints.
app.use("/api/v1/hotel-reservations", hotelReservationRoutes);

// Authenticated restaurant booking endpoints.
app.use(
  "/api/v1/restaurant-reservations",
  restaurantReservationRoutes,
);

// User notifications and reservation status history.
app.use("/api/v1/notifications", notificationRoutes);
app.use(
  "/api/v1/reservation-status-history",
  reservationHistoryRoutes,
);

// These must remain after all valid routes.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
