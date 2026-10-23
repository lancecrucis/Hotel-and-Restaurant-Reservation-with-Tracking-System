/*
Authentication Routes

This file connects authentication URLs to controller functions.

The full URL is created in two parts:

app.js:
  /api/v1/auth

This file:
  /register

Combined endpoint:
  POST /api/v1/auth/register
*/

const express = require("express");

const {
  register,
  login,
} = require("./auth.controller");

const router = express.Router();

// Send registration requests to the register controller.
router.post("/register", register);

// Send login requests to the login controller.
router.post("/login", login);

module.exports = router;