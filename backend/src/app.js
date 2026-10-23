const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from the React frontend.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Convert incoming JSON request bodies into JavaScript objects.
app.use(express.json());

// Simple route used to check whether the API is working.
app.get("/api/v1/health", (request, response) => {
  response.status(200).json({
    success: true,
    message: "API is running",
  });
});

module.exports = app;