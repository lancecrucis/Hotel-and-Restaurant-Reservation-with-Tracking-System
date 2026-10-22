
// A room can only use one of these database status values.
export type RoomStatus =
  | "available"
  | "maintenance"
  | "inactive";

// Room data returned by the room API.
// The frontend uses camelCase even though PostgreSQL uses snake_case.
export interface Room {

  // Database-generated room ID.
  id: number;

  // Human-readable number displayed to customers, such as "101".
  roomNumber: string;
  roomType: string;
  description: string;

  // Price for one night. The backend must convert PostgreSQL NUMERIC to number.
  pricePerNight: number;

  // Maximum number of guests allowed in the room.
  capacity: number;
  bedType: string;
  bedCount: number;
  status: RoomStatus;

  // `null` means the room does not have an image yet.
  imageUrl: string | null;
  hasWifi: boolean;
  breakfastIncluded: boolean;

  // A list such as ["Air conditioning", "Television"].
  specialAmenities: string[];
}
