export type TableStatus =
  | "available"
  | "maintenance"
  | "inactive";

export interface RestaurantTable {
  id: number;
  tableNumber: string;
  capacity: number;
  tableShape: string;
  status: TableStatus;
}