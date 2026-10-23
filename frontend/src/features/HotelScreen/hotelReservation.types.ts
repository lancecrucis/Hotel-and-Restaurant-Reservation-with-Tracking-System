export type HotelReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface HotelReservationRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  imageUrl: string | null;
}

export interface HotelReservationPayment {
  id: number;
  amount: number;
  method: "pay_at_hotel" | "credit_card" | "gcash";
  status: "pending" | "paid" | "failed" | "refunded";
  transactionReference: string;
  paidAt: string | null;
}

export interface HotelReservation {
  id: number;
  userId: number;
  reservationType: "hotel";
  status: HotelReservationStatus;
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
  checkIn: string;
  checkOut: string;
  guestCount: number;
  pricePerNight: number;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  specialRequests: string | null;
  room: HotelReservationRoom;
  payment: HotelReservationPayment | null;
}

export interface CreateHotelReservationInput {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  paymentMethod: HotelReservationPayment["method"];
}
