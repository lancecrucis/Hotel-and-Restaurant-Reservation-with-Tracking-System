/*
Authentication Middleware

Protected routes use this middleware to verify the JWT access token.
After verification, request.user contains the logged-in user's ID and role.
*/

const jwt = require("jsonwebtoken");

function authenticationError(message) {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function authenticate(request, response, next) {
  try {
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw authenticationError("You must log in to continue.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      throw authenticationError("The access token is invalid.");
    }

    request.user = {
      id: userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      next(authenticationError("Your login has expired. Please log in again."));
      return;
    }

    next(error);
  }
}

module.exports = authenticate;
