
// A restaurant table can only use one of these database status values.
export type TableStatus =
  | "available"
  | "maintenance"
  | "inactive";

// Restaurant table data returned by the restaurant table API.
// The frontend uses camelCase even though PostgreSQL uses snake_case.
export interface RestaurantTable {

  // Database-generated table ID.
  id: number;

  // Human-readable table number displayed to customers, such as "T01".
  tableNumber: string;

  // Maximum number of guests that can sit at the table.
  capacity: number;

  // Examples: Round, Square, or Rectangle.
  tableShape: string;
  status: TableStatus;
}

// Values entered in the restaurant table search form.
export interface RestaurantTableSearchParams {
  date: string;
  time: string;
  guests: number;
}

// Data returned after searching for available restaurant tables.
export interface RestaurantTableSearchResult {
  tables: RestaurantTable[];
  search: RestaurantTableSearchParams;
}
