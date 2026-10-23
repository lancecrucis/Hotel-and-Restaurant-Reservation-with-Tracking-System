/*
Restaurant Table Service

This file contains all PostgreSQL queries for restaurant tables.
The prototype returns at most five tables for a simple test screen.
*/

const { query } = require("../../config/database");

// Convert PostgreSQL snake_case fields into frontend camelCase fields.
function mapRestaurantTable(row) {
  return {
    id: Number(row.id),
    tableNumber: row.table_number,
    capacity: row.capacity,
    tableShape: row.table_shape,
    status: row.status,
  };
}

// GET /api/v1/restaurant/tables
async function getAllRestaurantTables() {
  const result = await query(`
    SELECT id, table_number, capacity, table_shape, status
    FROM restaurant_tables
    ORDER BY table_number
    LIMIT 5
  `);

  return result.rows.map(mapRestaurantTable);
}

// GET /api/v1/restaurant/tables/available
async function getAvailableRestaurantTables(guests) {
  const result = await query(
    `
      SELECT id, table_number, capacity, table_shape, status
      FROM restaurant_tables
      WHERE status = 'available'
        AND capacity >= $1
      ORDER BY capacity, table_number
      LIMIT 5
    `,
    [guests],
  );

  return result.rows.map(mapRestaurantTable);
}

// GET /api/v1/restaurant/tables/:tableId
async function getRestaurantTableById(tableId) {
  const result = await query(
    `
      SELECT id, table_number, capacity, table_shape, status
      FROM restaurant_tables
      WHERE id = $1
    `,
    [tableId],
  );

  if (result.rowCount === 0) {
    const error = new Error("Restaurant table not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapRestaurantTable(result.rows[0]);
}

module.exports = {
  getAllRestaurantTables,
  getAvailableRestaurantTables,
  getRestaurantTableById,
};
