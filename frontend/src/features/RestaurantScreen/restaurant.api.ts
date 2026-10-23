/*
Restaurant Table API

This file connects the restaurant screen to the Express endpoints.
*/

import { apiRequest } from "../../services/api";
import type {
  RestaurantTable,
  RestaurantTableSearchParams,
  RestaurantTableSearchResult,
} from "./table.types";

export async function getRestaurantTables(): Promise<
  RestaurantTable[]
> {
  const data = await apiRequest<{ tables: RestaurantTable[] }>(
    "/restaurant/tables",
  );

  return data.tables;
}

export async function searchAvailableRestaurantTables(
  search: RestaurantTableSearchParams,
): Promise<RestaurantTableSearchResult> {
  const query = new URLSearchParams({
    date: search.date,
    time: search.time,
    guests: String(search.guests),
  });

  return apiRequest<RestaurantTableSearchResult>(
    `/restaurant/tables/available?${query.toString()}`,
  );
}

export async function getRestaurantTableById(
  tableId: number,
): Promise<RestaurantTable> {
  const data = await apiRequest<{ table: RestaurantTable }>(
    `/restaurant/tables/${tableId}`,
  );

  return data.table;
}
