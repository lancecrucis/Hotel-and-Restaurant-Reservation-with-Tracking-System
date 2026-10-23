/* 
This service:
- Prevents duplicate emails
- Converts emails to lowercase
- Hashes passwords before saving
- Checks passwords during login
- Generates one-hour JWT access tokens
- Never returns password_hash
- Uses parameterized SQL to prevent SQL injection
*/

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const {query } = require("../../config/database")

// Convert PostgreSQL snake_case fields into frontend camelCase fields.
function mapUser(row){
    return{
    id: Number(row.id),
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    phoneNumber: row.phone_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create an error that the controller can return with the correct status code.
function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Create a signed access token for one user.
function createAccessToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
  );
}

// Register a new user.
async function registerUser(input) {
  const email = input.email.trim().toLowerCase();

  const existingUser = await query(
    "SELECT id FROM users WHERE LOWER(email) = $1",
    [email],
  );

  if (existingUser.rowCount > 0) {
    throw createError("An account with this email already exists.", 409);
  }

  // Never save the original password.
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await query(
      `
        INSERT INTO users (
          first_name,
          last_name,
          date_of_birth,
          email,
          password_hash,
          phone_number
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          role,
          first_name,
          last_name,
          date_of_birth,
          email,
          phone_number,
          created_at,
          updated_at
      `,
      [
        input.firstName.trim(),
        input.lastName.trim(),
        input.dateOfBirth || null,
        email,
        passwordHash,
        input.phoneNumber?.trim() || null,
      ],
    );

    const user = mapUser(result.rows[0]);

    return {
      user,
      accessToken: createAccessToken(user),
    };
  } catch (error) {
    // PostgreSQL code 23505 means a unique value already exists.
    if (error.code === "23505") {
      throw createError("An account with this email already exists.", 409);
    }

    throw error;
  }
}

// Log in using an email and password.
async function loginUser(input) {
  const email = input.email.trim().toLowerCase();

  const result = await query(
    `
      SELECT
        id,
        role,
        first_name,
        last_name,
        date_of_birth,
        email,
        phone_number,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE LOWER(email) = $1
    `,
    [email],
  );

  if (result.rowCount === 0) {
    throw createError("Invalid email or password.", 401);
  }

  const row = result.rows[0];
  const passwordIsCorrect = await bcrypt.compare(
    input.password,
    row.password_hash,
  );

  if (!passwordIsCorrect) {
    throw createError("Invalid email or password.", 401);
  }

  const user = mapUser(row);

  return {
    user,
    accessToken: createAccessToken(user),
  };
}

// Retrieve the currently authenticated user.
async function getUserById(userId) {
  const result = await query(
    `
      SELECT
        id,
        role,
        first_name,
        last_name,
        date_of_birth,
        email,
        phone_number,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  if (result.rowCount === 0) {
    throw createError("User not found.", 404);
  }

  return mapUser(result.rows[0]);
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};