/*
Authentication API

This file contains requests used only by the authentication feature.

It uses the shared apiRequest function instead of repeating fetch code
inside the Login and Register components.
*/

import { apiRequest } from "../../services/api";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth.types";

// Send registration information to the backend.
export function registerAccount(
  input: RegisterInput,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Send login information to the backend.
export function loginAccount(
  input: LoginInput,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}