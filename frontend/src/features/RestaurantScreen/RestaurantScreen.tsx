import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";

import SectionToggle from "../../components/SectionToggle";
import {
  getRestaurantTableById,
  getRestaurantTables,
  searchAvailableRestaurantTables,
} from "./restaurant.api";
import { createRestaurantReservation } from "./restaurantReservations.api";
import type { RestaurantTable } from "./table.types";

function calculateEndTime(startTime: string) {
  if (!startTime) return "";

  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + 120;

  if (endMinutes >= 24 * 60) return "Invalid time";

  const endHours = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const endMinuteValue = String(endMinutes % 60).padStart(2, "0");
  return `${endHours}:${endMinuteValue}`;
}

export default function RestaurantScreen() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTable, setSelectedTable] =
    useState<RestaurantTable | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const endTime = calculateEndTime(time);

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
      setBookingMessage("");
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

  async function handleBookTable(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedTable) {
      return;
    }

    try {
      setBookingLoading(true);
      setBookingMessage("");

      const reservation = await createRestaurantReservation({
        tableId: selectedTable.id,
        reservationDate: date,
        startTime: time,
        guestCount: guests,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || undefined,
      });

      setMessage(
        `Restaurant reservation confirmed. Reference: ${reservation.reservationReference}`,
      );
      setSelectedTable(null);
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setSpecialRequests("");

      const searchResult = await searchAvailableRestaurantTables({
        date,
        time,
        guests,
      });
      setTables(searchResult.tables.slice(0, 5));
    } catch (error) {
      setBookingMessage(
        error instanceof Error
          ? error.message
          : "Could not create the restaurant reservation.",
      );
    } finally {
      setBookingLoading(false);
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
        className="mb-8 grid gap-4 rounded bg-gray-100 p-4 md:grid-cols-5"
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
          <span className="mb-1 block">Start time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="w-full rounded bg-white p-2"
            required
          />
          <span className="text-xs text-gray-600">
            Each reservation lasts two hours.
          </span>
        </label>

        <label>
          <span className="mb-1 block">End time</span>
          <input
            type="time"
            value={endTime === "Invalid time" ? "" : endTime}
            readOnly
            className="w-full rounded bg-gray-200 p-2 text-gray-700"
          />
          <span className="text-xs text-gray-600">Automatically set to two hours later.</span>
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
            {time && endTime !== "Invalid time" && (
              <span className="block">Time: {time}–{endTime}</span>
            )}
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded bg-white p-6 shadow-lg"
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
              {time && endTime !== "Invalid time" && (
                <p>Reservation time: {time} to {endTime}</p>
              )}
            </div>

            <hr className="my-5" />

            <h3 className="mb-3 text-lg font-semibold">
              Reserve this table
            </h3>

            {!localStorage.getItem("accessToken") ? (
              <p>
                <Link to="/login" className="text-blue-700 underline">
                  Log in
                </Link>{" "}
                before reserving this table.
              </p>
            ) : (
              <form onSubmit={handleBookTable} className="space-y-3">
                <label className="block">
                  <span className="mb-1 block">Reservation date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded border p-2"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block">Start time</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded border p-2"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block">End time</span>
                  <input
                    type="time"
                    value={endTime === "Invalid time" ? "" : endTime}
                    readOnly
                    className="w-full rounded border bg-gray-100 p-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block">Guests</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedTable.capacity}
                    value={guests}
                    onChange={(event) =>
                      setGuests(Number(event.target.value))
                    }
                    className="w-full rounded border p-2"
                    required
                  />
                </label>

                <input
                  type="text"
                  placeholder="Contact name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  maxLength={101}
                  className="w-full rounded border p-2"
                  required
                />

                <input
                  type="email"
                  placeholder="Contact email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  maxLength={100}
                  className="w-full rounded border p-2"
                  required
                />

                <input
                  type="tel"
                  placeholder="Contact phone (11 digits)"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  pattern="[0-9]{11}"
                  maxLength={11}
                  className="w-full rounded border p-2"
                  required
                />

                <textarea
                  placeholder="Special requests (optional)"
                  value={specialRequests}
                  onChange={(event) =>
                    setSpecialRequests(event.target.value)
                  }
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded border p-2"
                />

                {bookingMessage && (
                  <p className="text-sm text-red-700">
                    {bookingMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
                >
                  {bookingLoading
                    ? "Reserving..."
                    : "Confirm reservation"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
