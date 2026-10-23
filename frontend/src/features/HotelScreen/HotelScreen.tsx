import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  getRoomById,
  getRooms,
  searchAvailableRooms,
} from "./rooms.api";

import SectionToggle from "../../components/SectionToggle";
import type { Room } from "./room.types";

export default function HotelScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] =
    useState<Room | null>(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load every room when the screen first opens.
  useEffect(() => {
    async function loadRooms() {
      try {
        setLoading(true);

        const roomList = await getRooms();
        setRooms(roomList);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load rooms.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRooms();
  }, []);

  // Search rooms using the form values.
  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSelectedRoom(null);

      const result = await searchAvailableRooms({
        checkIn,
        checkOut,
        guests,
      });

      setRooms(result.rooms);

      if (result.rooms.length === 0) {
        setMessage("No available rooms were found.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not search for rooms.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Retrieve complete details when a room card is clicked.
  async function handleRoomClick(roomId: number) {
    try {
      setLoading(true);
      setMessage("");

      const room = await getRoomById(roomId);
      setSelectedRoom(room);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load the room.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Return to the complete room list.
  async function handleShowAllRooms() {
    try {
      setLoading(true);
      setMessage("");
      setSelectedRoom(null);

      const roomList = await getRooms();
      setRooms(roomList);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load rooms.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <SectionToggle />

      <h1 className="mb-6 text-2xl font-semibold">
        Hotel Rooms
      </h1>

      <form
        onSubmit={handleSearch}
        className="mb-8 grid gap-4 rounded bg-gray-100 p-4 md:grid-cols-4"
      >
        <label>
          <span className="mb-1 block">Check in</span>

          <input
            type="date"
            value={checkIn}
            onChange={(event) =>
              setCheckIn(event.target.value)
            }
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <label>
          <span className="mb-1 block">Check out</span>

          <input
            type="date"
            value={checkOut}
            onChange={(event) =>
              setCheckOut(event.target.value)
            }
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
            onClick={() => void handleShowAllRooms()}
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

      <section className="grid gap-4 md:grid-cols-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => void handleRoomClick(room.id)}
            className="rounded bg-gray-100 p-4 text-left hover:bg-gray-200"
          >
            <h2 className="text-lg font-semibold">
              {room.roomType}
            </h2>

            <p>Room {room.roomNumber}</p>
            <p>₱{room.pricePerNight.toLocaleString()} per night</p>
            <p>Maximum guests: {room.capacity}</p>
            <p>Status: {room.status}</p>

            <span className="mt-3 block text-blue-700">
              Click to view details
            </span>
          </button>
        ))}
      </section>

      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedRoom(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-details-title"
            className="w-full max-w-lg rounded bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2
                id="room-details-title"
                className="text-xl font-semibold"
              >
                Room details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="rounded bg-gray-700 px-3 py-1 text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <p>Room: {selectedRoom.roomNumber}</p>
              <p>Type: {selectedRoom.roomType}</p>
              <p>Description: {selectedRoom.description}</p>
              <p>
                Price: ₱
                {selectedRoom.pricePerNight.toLocaleString()} per night
              </p>
              <p>
                Bed: {selectedRoom.bedCount} {selectedRoom.bedType}
              </p>
              <p>Maximum guests: {selectedRoom.capacity}</p>
              <p>Wi-Fi: {selectedRoom.hasWifi ? "Yes" : "No"}</p>
              <p>
                Breakfast included:{" "}
                {selectedRoom.breakfastIncluded ? "Yes" : "No"}
              </p>
              <p>
                Amenities:{" "}
                {selectedRoom.specialAmenities.join(", ") || "None"}
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
