export type RestaurantReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface RestaurantReservationTable {
  id: number;
  tableNumber: string;
  capacity: number;
  tableShape: string;
}

export interface RestaurantReservation {
  id: number;
  userId: number;
  reservationType: "restaurant";
  status: RestaurantReservationStatus;
  totalAmount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  reservationReference: string;
  holdExpiresAt: string | null;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  specialRequests: string | null;
  arrivedAt: string | null;
  seatedAt: string | null;
  completedAt: string | null;
  table: RestaurantReservationTable;
}

export interface CreateRestaurantReservationInput {
  tableId: number;
  reservationDate: string;
  startTime: string;
  guestCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}
