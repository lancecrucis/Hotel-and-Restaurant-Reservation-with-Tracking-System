export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  email: string;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}