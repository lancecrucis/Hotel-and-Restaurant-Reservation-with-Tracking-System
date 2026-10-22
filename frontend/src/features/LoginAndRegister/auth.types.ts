
// These are the only user roles accepted by the frontend and database.
export type UserRole = "customer" | "admin";

// Safe user information returned by the API.
// Never add password or passwordHash to this interface.
export interface User {

  // Database-generated user ID.
  id: number;
  role: UserRole;
  firstName: string;
  lastName: string;

  // Optional values use `null` when the database has no value.
  dateOfBirth: string | null;
  email: string;
  phoneNumber: string | null;

  // PostgreSQL timestamps are returned as ISO date strings.
  createdAt: string;
  updatedAt: string;
}

// Data sent to POST /api/v1/auth/register.
export interface RegisterInput {
  firstName: string;
  lastName: string;

  // The question mark means the field is optional during registration.
  dateOfBirth?: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Data sent to POST /api/v1/auth/login.
export interface LoginInput {
  email: string;
  password: string;
}

// Expected successful response after registration or login.
export interface AuthResponse {
  user: User;
  accessToken: string;
}
