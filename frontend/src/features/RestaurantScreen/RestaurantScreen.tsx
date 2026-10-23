import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  getRestaurantTableById,
  getRestaurantTables,
  searchAvailableRestaurantTables,
} from "./restaurant.api";
import SectionToggle from "../../components/SectionToggle";
import type { RestaurantTable } from "./table.types";

export default function RestaurantScreen() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTables() {
      try {
        setLoading(true);
        setTables(await getRestaurantTables());
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load restaurant tables.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTables();
  }, []);

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSelectedTable(null);

      const result = await searchAvailableRestaurantTables({
        date,
        time,
        guests,
      });

      setTables(result.tables.slice(0, 5));

      if (result.tables.length === 0) {
        setMessage("No available restaurant tables were found.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not search restaurant tables.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleShowAllTables() {
    try {
      setLoading(true);
      setMessage("");
      setSelectedTable(null);
      setTables((await getRestaurantTables()).slice(0, 5));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load restaurant tables.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTableClick(tableId: number) {
    try {
      setLoading(true);
      setMessage("");
      setSelectedTable(await getRestaurantTableById(tableId));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load the restaurant table.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <SectionToggle />

      <h1 className="mb-6 text-2xl font-semibold">
        Restaurant Tables
      </h1>

      <form
        onSubmit={handleSearch}
        className="mb-8 grid gap-4 rounded bg-gray-100 p-4 md:grid-cols-4"
      >
        <label>
          <span className="mb-1 block">Reservation date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <label>
          <span className="mb-1 block">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <label>
          <span className="mb-1 block">Guests</span>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(event) =>
              setGuests(Number(event.target.value))
            }
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => void handleShowAllTables()}
            className="rounded bg-gray-700 px-4 py-2 text-white"
          >
            Show all
          </button>
        </div>
      </form>

      {message && (
        <p className="mb-4 rounded bg-yellow-100 p-3">
          {message}
        </p>
      )}

      {loading && <p className="mb-4">Loading...</p>}

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        {tables.slice(0, 5).map((table) => (
          <button
            key={table.id}
            type="button"
            onClick={() => void handleTableClick(table.id)}
            className="rounded bg-gray-100 p-5 text-left hover:bg-gray-200"
          >
            <strong className="block text-lg">
              Table {table.tableNumber}
            </strong>
            <span className="block">Seats: {table.capacity}</span>
            <span className="block">Shape: {table.tableShape}</span>
            <span className="mt-2 block text-blue-700">
              Click for details
            </span>
          </button>
        ))}
      </section>

      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTable(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-details-title"
            className="w-full max-w-md rounded bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="table-details-title"
                className="text-xl font-semibold"
              >
                Restaurant table details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="rounded bg-gray-700 px-3 py-1 text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <p>Table number: {selectedTable.tableNumber}</p>
              <p>Maximum guests: {selectedTable.capacity}</p>
              <p>Shape: {selectedTable.tableShape}</p>
              <p>Status: {selectedTable.status}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
