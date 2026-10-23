/*
this
1. Read the error's HTTP status code.
2. Log unexpected server errors.
3. Return one consistent JSON error response.
4. Hide internal server details from users.

Express recognizes this as error middleware because it has
four parameters: error, request, response, and next.
*/

// Handle requests that do not match an existing API endpoint.
function notFound(request, response, next) {
  const error = new Error(
    `Route not found: ${request.method} ${request.originalUrl}`,
  );

  error.statusCode = 404;
  next(error);
}

// Return errors using one consistent JSON format.
function errorHandler(error, request, response, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An unexpected server error occurred."
        : error.message,
  });
}

module.exports = {
  notFound,
  errorHandler,
};