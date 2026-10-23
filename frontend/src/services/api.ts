/*
Shared API Client

This function sends requests from React to the Express backend.

It:
1. Adds JSON headers.
2. Adds the access token when one exists.
3. Converts the response into JavaScript data.
4. Throws an error when the request fails.
*/

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Include the JWT when the user has logged in.
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request failed.");
  }

  if (result.data === undefined) {
    throw new Error("The server did not return the expected data.");
  }

  return result.data;
}