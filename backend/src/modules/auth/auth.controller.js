/*
This
1. Read information sent by the frontend from request.body.
2. Validate registration and login information.
3. Call auth.service.js to perform database and authentication work.
4. Return a JSON response with the correct HTTP status code.
5. Pass errors to the shared Express error handler.
 */

const {
  registerUser,
  loginUser,
  getUserById,
} = require("./auth.service");

// Create an error for invalid registration information.
function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// Check whether an email has a basic valid format.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/v1/auth/register
async function register(request, response, next) {
  try {
    // request.body contains the JSON sent by the frontend.
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      password,
      phoneNumber,
    } = request.body || {};

    if (
      typeof firstName !== "string" ||
      !firstName.trim() ||
      firstName.trim().length > 50
    ) {
      throw validationError(
        "First name is required and cannot exceed 50 characters.",
      );
    }

    if (
      typeof lastName !== "string" ||
      !lastName.trim() ||
      lastName.trim().length > 50
    ) {
      throw validationError(
        "Last name is required and cannot exceed 50 characters.",
      );
    }

    if (
      typeof email !== "string" ||
      email.trim().length > 100 ||
      !isValidEmail(email.trim())
    ) {
      throw validationError("A valid email address is required.");
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      throw validationError(
        "Password must be at least 8 characters and no more than 72 bytes.",
      );
    }

    if (
      phoneNumber &&
      (typeof phoneNumber !== "string" ||
        !/^\d{11}$/.test(phoneNumber.trim()))
    ) {
      throw validationError(
        "Phone number must contain exactly 11 digits.",
      );
    }

    if (
      dateOfBirth &&
      (typeof dateOfBirth !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))
    ) {
      throw validationError(
        "Date of birth must use the YYYY-MM-DD format.",
      );
    }

    // The service hashes the password and inserts the user.
    const result = await registerUser({
      firstName,
      lastName,
      dateOfBirth,
      email,
      password,
      phoneNumber,
    });

    // HTTP 201 means a new resource was created.
    response.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Pass errors to the shared Express error handler.
    next(error);
  }
}

// POST /api/v1/auth/login
async function login(request, response, next) {
  try {
    // Read the login information sent by the frontend.
    const { email, password } = request.body || {};

    if (
      typeof email !== "string" ||
      email.trim().length > 100 ||
      !isValidEmail(email.trim())
    ) {
      throw validationError("A valid email address is required.");
    }

    if (typeof password !== "string" || !password) {
      throw validationError("Password is required.");
    }

    // The service finds the user, checks the password, and creates a JWT.
    const result = await loginUser({
      email,
      password,
    });

    // HTTP 200 means the login request succeeded.
    response.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/auth/me
async function getCurrentUser(request, response, next) {
  try {
    const user = await getUserById(request.user.id);

    response.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
