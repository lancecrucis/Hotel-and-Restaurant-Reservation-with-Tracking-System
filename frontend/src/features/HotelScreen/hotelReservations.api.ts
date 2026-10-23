/*
Hotel Reservation API

These requests are protected. The shared API client automatically includes
the JWT access token saved after login or registration.
*/

import { apiRequest } from "../../services/api";
import type {
  CreateHotelReservationInput,
  HotelReservation,
} from "./hotelReservation.types";

export async function createHotelReservation(
  input: CreateHotelReservationInput,
): Promise<HotelReservation> {
  const data = await apiRequest<{ reservation: HotelReservation }>(
    "/hotel-reservations",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return data.reservation;
}

export async function getMyHotelReservations(): Promise<
  HotelReservation[]
> {
  const data = await apiRequest<{
    reservations: HotelReservation[];
  }>("/hotel-reservations/me");

  return data.reservations;
}

export async function cancelHotelReservation(
  reservationId: number,
): Promise<HotelReservation> {
  const data = await apiRequest<{ reservation: HotelReservation }>(
    `/hotel-reservations/${reservationId}/cancel`,
    {
      method: "PATCH",
      body: JSON.stringify({
        reason: "Cancelled by customer.",
      }),
    },
  );

  return data.reservation;
}
