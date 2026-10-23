export interface Notification {
  id: number;
  userId: number;
  reservationId: number | null;
  reservationType: "hotel" | "restaurant" | null;
  reservationReference: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReservationStatusHistory {
  id: number;
  reservationId: number;
  reservationType: "hotel" | "restaurant";
  reservationReference: string;
  previousStatus: string | null;
  newStatus: string;
  changedAt: string;
}
