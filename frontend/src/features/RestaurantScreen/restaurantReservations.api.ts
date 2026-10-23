/* Restaurant reservation requests protected by the saved JWT token. */

import { apiRequest } from "../../services/api";
import type {
  CreateRestaurantReservationInput,
  RestaurantReservation,
} from "./restaurantReservation.types";

export async function createRestaurantReservation(
  input: CreateRestaurantReservationInput,
): Promise<RestaurantReservation> {
  const data = await apiRequest<{
    reservation: RestaurantReservation;
  }>("/restaurant-reservations", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.reservation;
}

export async function getMyRestaurantReservations(): Promise<
  RestaurantReservation[]
> {
  const data = await apiRequest<{
    reservations: RestaurantReservation[];
  }>("/restaurant-reservations/me");

  return data.reservations;
}

export async function cancelRestaurantReservation(
  reservationId: number,
): Promise<RestaurantReservation> {
  const data = await apiRequest<{
    reservation: RestaurantReservation;
  }>(`/restaurant-reservations/${reservationId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason: "Cancelled by customer." }),
  });

  return data.reservation;
}
