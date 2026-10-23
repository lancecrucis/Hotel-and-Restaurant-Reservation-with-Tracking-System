/*
Application Router

This file connects browser URLs to React pages.

Current routes:
- /login displays the login page.
- /register displays the registration page.
- /rooms displays the hotel room prototype.
- /restaurant displays the restaurant table prototype.
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
import HotelScreen from "../features/HotelScreen/HotelScreen";
import RestaurantScreen from "../features/RestaurantScreen/RestaurantScreen";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms" element={<HotelScreen />} />
        <Route path="/restaurant" element={<RestaurantScreen />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
