/*
Simple Login Page

This form sends an email and password to:
POST /api/v1/auth/login

After a successful login, it stores the access token in localStorage.
*/

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginAccount } from "./auth.api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsLoading(true);

    try {
      const result = await loginAccount({
        email,
        password,
      });

      // Save the JWT so protected requests can use it later.
      localStorage.setItem("accessToken", result.accessToken);

      // Continue to the hotel screen after a successful login.
      navigate("/rooms", { replace: true });
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Login failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded bg-white p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter your test account details.
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={100}
          autoComplete="email"
          required
          className="w-full rounded border p-2"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded border p-2"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>

        {message && (
          <p
            className={
              isError ? "text-sm text-red-600" : "text-sm text-green-600"
            }
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          Do not have an account?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
