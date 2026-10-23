/*
Room API

This file connects the hotel screen to the Express room endpoints.
It keeps fetch logic outside the React component.
*/

import { apiRequest } from "../../services/api";
import type {
  Room,
  RoomSearchParams,
  RoomSearchResult,
} from "./room.types";

// Get every room from the database.
export async function getRooms(): Promise<Room[]> {
  const data = await apiRequest<{ rooms: Room[] }>("/rooms");

  return data.rooms;
}

// Search available rooms using dates and guest count.
export async function searchAvailableRooms(
  search: RoomSearchParams,
): Promise<RoomSearchResult> {
  const query = new URLSearchParams({
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    guests: String(search.guests),
  });

  return apiRequest<RoomSearchResult>(
    `/rooms/available?${query.toString()}`,
  );
}

// Get the complete details of one selected room.
export async function getRoomById(
  roomId: number,
): Promise<Room> {
  const data = await apiRequest<{ room: Room }>(
    `/rooms/${roomId}`,
  );

  return data.room;
}