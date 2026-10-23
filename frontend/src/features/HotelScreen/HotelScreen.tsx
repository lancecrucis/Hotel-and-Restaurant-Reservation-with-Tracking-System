import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import SectionToggle from "../../components/SectionToggle";
import type { Room } from "./room.types";
import { getRoomById, getRooms, searchAvailableRooms } from "./rooms.api";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function calculateNights(checkIn: string, checkOut: string) {
  const arrival = new Date(`${checkIn}T00:00:00Z`).getTime();
  const departure = new Date(`${checkOut}T00:00:00Z`).getTime();

  if (!Number.isFinite(arrival) || !Number.isFinite(departure)) return 0;
  return Math.max(0, Math.round((departure - arrival) / 86_400_000));
}

export default function HotelScreen() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = toDateInputValue(new Date());
  const nights = calculateNights(checkIn, checkOut);
  const totalAmount = useMemo(
    () => (selectedRoom ? selectedRoom.pricePerNight * nights : 0),
    [nights, selectedRoom],
  );

  useEffect(() => {
    async function loadRooms() {
      try {
        setLoading(true);
        setRooms(await getRooms());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load rooms.");
      } finally {
        setLoading(false);
      }
    }

    void loadRooms();
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setSelectedRoom(null);
      const result = await searchAvailableRooms({ checkIn, checkOut, guests });
      setRooms(result.rooms);
      if (result.rooms.length === 0) setMessage("No available rooms were found.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not search for rooms.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoomClick(roomId: number) {
    try {
      setLoading(true);
      setMessage("");
      if (!checkIn) {
        const tomorrow = addDays(today, 1);
        setCheckIn(tomorrow);
        setCheckOut(addDays(tomorrow, 2));
      } else if (!checkOut || checkOut <= checkIn) {
        setCheckOut(addDays(checkIn, 2));
      }
      setSelectedRoom(await getRoomById(roomId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the room.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShowAllRooms() {
    try {
      setLoading(true);
      setMessage("");
      setSelectedRoom(null);
      setRooms(await getRooms());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load rooms.");
    } finally {
      setLoading(false);
    }
  }

  function proceedToCheckout() {
    if (!selectedRoom || nights < 1) return;
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }

    const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/checkout/${selectedRoom.id}?${query.toString()}`);
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <SectionToggle />

      <h1 className="mb-6 text-2xl font-semibold">Hotel Rooms</h1>

      <form onSubmit={handleSearch} className="mb-8 grid gap-4 rounded bg-gray-100 p-4 md:grid-cols-4">
        <label>
          <span className="mb-1 block">Check in</span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => {
              const value = event.target.value;
              setCheckIn(value);
              if (!checkOut || checkOut <= value) setCheckOut(addDays(value, 1));
            }}
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <label>
          <span className="mb-1 block">Check out</span>
          <input
            type="date"
            min={checkIn ? addDays(checkIn, 1) : today}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
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
            onChange={(event) => setGuests(Number(event.target.value))}
            className="w-full rounded bg-white p-2"
            required
          />
        </label>

        <div className="flex items-end gap-2">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
          <button type="button" onClick={() => void handleShowAllRooms()} className="rounded bg-gray-700 px-4 py-2 text-white">Show all</button>
        </div>
      </form>

      {message && <p className="mb-4 rounded bg-yellow-100 p-3">{message}</p>}
      {loading && <p className="mb-4">Loading...</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => void handleRoomClick(room.id)}
            className="overflow-hidden rounded bg-gray-100 text-left hover:bg-gray-200"
          >
            {room.imageUrl ? (
              <img src={room.imageUrl} alt={`${room.roomType} room ${room.roomNumber}`} className="h-44 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-44 items-center justify-center bg-gray-300">No room image</div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold">{room.roomType}</h2>
              <p>Room {room.roomNumber}</p>
              <p>₱{room.pricePerNight.toLocaleString()} per night</p>
              <p>Maximum guests: {room.capacity}</p>
              <p>Status: {room.status}</p>
              <span className="mt-3 block text-blue-700">Click to view details</span>
            </div>
          </button>
        ))}
      </section>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="room-details-title">
          <div className="relative grid max-h-[90vh] w-full max-w-5xl gap-6 overflow-y-auto rounded-xl bg-white p-5 text-gray-900 shadow-xl lg:grid-cols-[1.15fr_0.85fr]">
          <button
            type="button"
            onClick={() => setSelectedRoom(null)}
            aria-label="Close room details"
            className="absolute right-4 top-3 z-10 rounded bg-gray-200 px-3 py-1 text-2xl text-gray-700 hover:bg-gray-300"
          >×</button>

            <section className="min-w-0 pt-10 lg:pt-0">
              {selectedRoom.imageUrl ? (
                <img src={selectedRoom.imageUrl} alt={`${selectedRoom.roomType} room ${selectedRoom.roomNumber}`} className="h-64 w-full rounded-xl object-cover sm:h-80" />
              ) : (
                <div className="grid h-64 place-items-center rounded-xl bg-gray-200 sm:h-80">No room image</div>
              )}

              <div className="mt-3 grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((thumbnail) => (
                  <div key={thumbnail} className="overflow-hidden rounded-lg border border-gray-200 first:border-blue-500">
                    {selectedRoom.imageUrl ? (
                      <img src={selectedRoom.imageUrl} alt="" className="h-16 w-full object-cover" />
                    ) : (
                      <div className="h-16 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>

              <h2 id="room-details-title" className="mt-6 text-2xl font-semibold">{selectedRoom.roomType} Room</h2>
              <p className="mt-1 text-2xl font-semibold">₱{selectedRoom.pricePerNight.toLocaleString()}<span className="text-base font-normal"> / night</span></p>

              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-base">
                <span>♙ {selectedRoom.capacity} Guests</span>
                <span>▱ {selectedRoom.bedCount} {selectedRoom.bedType} Bed</span>
                <span>{selectedRoom.hasWifi ? "⌁ Free Wi-Fi" : "No Wi-Fi"}</span>
                <span>{selectedRoom.breakfastIncluded ? "♨ Breakfast Included" : "Breakfast Not Included"}</span>
              </div>

              {selectedRoom.specialAmenities.length > 0 && <p className="mt-4 text-gray-600">{selectedRoom.specialAmenities.join(" · ")}</p>}
              <p className="mt-3 leading-relaxed">{selectedRoom.description}</p>
            </section>

            <aside className="min-w-0 self-start overflow-hidden rounded-xl border border-gray-200 bg-gray-50 lg:mt-4">
              <div className="p-6">
                <h3 className="text-2xl font-semibold">Select Dates</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="min-w-0">
                    <span className="mb-1 block text-lg">Check-in</span>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCheckIn(value);
                        if (!checkOut || checkOut <= value) setCheckOut(addDays(value, 1));
                      }}
                      className="min-w-0 w-full rounded-lg border border-stone-300 px-3 py-3 text-lg"
                      required
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="mb-1 block text-lg">Check-out</span>
                    <input
                      type="date"
                      min={checkIn ? addDays(checkIn, 1) : today}
                      value={checkOut}
                      onChange={(event) => setCheckOut(event.target.value)}
                      className="min-w-0 w-full rounded-lg border border-stone-300 px-3 py-3 text-lg"
                      required
                    />
                  </label>
                </div>

                <label className="mt-8 block">
                  <span className="mb-2 block text-xl font-semibold">Guests</span>
                  <select
                    value={Math.min(guests, selectedRoom.capacity)}
                    onChange={(event) => setGuests(Number(event.target.value))}
                    className="w-full rounded-lg border border-stone-300 px-4 py-3 text-lg"
                  >
                    {Array.from({ length: selectedRoom.capacity }, (_, index) => index + 1).map((guestCount) => (
                      <option key={guestCount} value={guestCount}>{guestCount} {guestCount === 1 ? "Guest" : "Guests"}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="border-t border-stone-300 p-6">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <p className="text-3xl font-bold">₱{totalAmount.toLocaleString()}</p>
                  <p className="text-right text-lg">/ {nights} {nights === 1 ? "night" : "nights"}</p>
                </div>
                <button
                  type="button"
                  onClick={proceedToCheckout}
                  disabled={nights < 1 || guests > selectedRoom.capacity}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >Book Now</button>
                {!localStorage.getItem("accessToken") && <p className="mt-3 text-center text-sm text-stone-600">You will be asked to log in before checkout.</p>}
              </div>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
