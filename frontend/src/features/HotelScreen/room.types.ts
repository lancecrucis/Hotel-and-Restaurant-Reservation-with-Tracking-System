export type RoomStatus =
  | "available"
  | "maintenance"
  | "inactive";

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  bedCount: number;
  status: RoomStatus;
  imageUrl: string | null;
  hasWifi: boolean;
  breakfastIncluded: boolean;
  specialAmenities: string[];
}