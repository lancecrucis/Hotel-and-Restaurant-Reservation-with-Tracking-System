/*
Simple Registration Page

This form collects customer information and sends it to:
POST /api/v1/auth/register

It is intentionally simple so the authentication flow can be tested
before creating the final design.
*/

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { registerAccount } from "./auth.api";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
      const result = await registerAccount({
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        email,
        phoneNumber: phoneNumber || undefined,
        password,
      });

      // Save the JWT so protected requests can use it later.
      localStorage.setItem("accessToken", result.accessToken);

      setMessage(`Account created for ${result.user.email}.`);

      // Clear the form after successful registration.
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Registration failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded bg-white p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill in the fields to test registration.
          </p>
        </div>

        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          maxLength={50}
          required
          className="w-full rounded border p-2"
        />

        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          maxLength={50}
          required
          className="w-full rounded border p-2"
        />

        <input
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          className="w-full rounded border p-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={100}
          required
          className="w-full rounded border p-2"
        />

        <input
          type="tel"
          placeholder="Phone number (11 digits)"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          pattern="[0-9]{11}"
          maxLength={11}
          className="w-full rounded border p-2"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
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
          {isLoading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
