/*
Application Router

This file connects browser URLs to React pages.

Current routes:
- /login displays the login page.
- /register displays the registration page.
- Unknown URLs redirect to /login.
*/

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../features/LoginAndRegister/Login";
import Register from "../features/LoginAndRegister/Register";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;