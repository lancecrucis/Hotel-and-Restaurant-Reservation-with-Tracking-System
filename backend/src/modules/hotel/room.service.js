/*
Room Service

This file handles PostgreSQL work for hotel rooms.

Its responsibilities are:
1. Retrieve all rooms.
2. Find available rooms that fit the guest count and requested dates.
3. Retrieve one room using its ID.
4. Convert PostgreSQL fields into frontend-friendly fields.

Date validation belongs in room.controller.js. Availability excludes rooms
with confirmed or active pending reservations that overlap the search dates.
*/

const { query } = require("../../config/database");

// Convert PostgreSQL snake_case fields into frontend camelCase fields.
function mapRoom(row) {
  return {
    id: Number(row.id),
    roomNumber: row.room_number,
    roomType: row.room_type,
    description: row.description,

    // PostgreSQL returns NUMERIC values as strings.
    pricePerNight: Number(row.price_per_night),

    capacity: row.capacity,
    bedType: row.bed_type,
    bedCount: row.bed_count,
    status: row.status,
    imageUrl: row.image_url,
    hasWifi: row.has_wifi,
    breakfastIncluded: row.breakfast_included,
    specialAmenities: row.special_amenities,
  };
}

// GET /api/v1/rooms
async function getAllRooms() {
  const result = await query(`
    SELECT
      id,
      room_number,
      room_type,
      description,
      price_per_night,
      capacity,
      bed_type,
      bed_count,
      status,
      image_url,
      has_wifi,
      breakfast_included,
      special_amenities
    FROM rooms
    ORDER BY room_number
  `);

  return result.rows.map(mapRoom);
}

// GET /api/v1/rooms/available
async function getAvailableRooms(checkIn, checkOut, guests) {
  const result = await query(
    `
      SELECT
        id,
        room_number,
        room_type,
        description,
        price_per_night,
        capacity,
        bed_type,
        bed_count,
        status,
        image_url,
        has_wifi,
        breakfast_included,
        special_amenities
      FROM rooms
      WHERE status = 'available'
        AND capacity >= $1
        AND NOT EXISTS (
          SELECT 1
          FROM hotel_reservations AS hr
          INNER JOIN reservations AS r
            ON r.id = hr.reservation_id
          WHERE hr.room_id = rooms.id
            AND hr.check_in < $3::date
            AND hr.check_out > $2::date
            AND (
              r.status = 'confirmed'
              OR (
                r.status = 'pending'
                AND (
                  r.hold_expires_at IS NULL
                  OR r.hold_expires_at > CURRENT_TIMESTAMP
                )
              )
            )
        )
      ORDER BY price_per_night, room_number
    `,
    [guests, checkIn, checkOut],
  );

  return result.rows.map(mapRoom);
}

// GET /api/v1/rooms/:roomId
async function getRoomById(roomId) {
  const result = await query(
    `
      SELECT
        id,
        room_number,
        room_type,
        description,
        price_per_night,
        capacity,
        bed_type,
        bed_count,
        status,
        image_url,
        has_wifi,
        breakfast_included,
        special_amenities
      FROM rooms
      WHERE id = $1
    `,
    [roomId],
  );

  if (result.rowCount === 0) {
    const error = new Error("Room not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapRoom(result.rows[0]);
}

module.exports = {
  getAllRooms,
  getAvailableRooms,
  getRoomById,
};
