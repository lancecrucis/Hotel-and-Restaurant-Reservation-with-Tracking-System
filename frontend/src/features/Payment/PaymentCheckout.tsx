import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { getCurrentUser } from "../LoginAndRegister/auth.api";
import { createHotelReservation } from "../HotelScreen/hotelReservations.api";
import { getRoomById } from "../HotelScreen/rooms.api";
import type { HotelReservation } from "../HotelScreen/hotelReservation.types";
import type { Room } from "../HotelScreen/room.types";

type CheckoutStep = 1 | 2 | 3 | 4;
type PaymentMethod = "pay_at_hotel" | "credit_card" | "gcash";

const stepLabels = [
  "Booking Details",
  "Guest Information",
  "Payment",
  "Confirmation",
] as const;

function displayDate(value: string) {
  if (!value) {
    return "Not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function calculateNights(checkIn: string, checkOut: string) {
  const arrival = new Date(`${checkIn}T00:00:00Z`).getTime();
  const departure = new Date(`${checkOut}T00:00:00Z`).getTime();

  if (!Number.isFinite(arrival) || !Number.isFinite(departure)) {
    return 0;
  }

  return Math.max(0, Math.round((departure - arrival) / 86_400_000));
}

export default function PaymentCheckout() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const guests = Number(searchParams.get("guests") ?? "1");

  const [room, setRoom] = useState<Room | null>(null);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("pay_at_hotel");
  const [reservation, setReservation] =
    useState<HotelReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nights = calculateNights(checkIn, checkOut);
  const totalAmount = room ? room.pricePerNight * nights : 0;

  useEffect(() => {
    async function loadCheckout() {
      const numericRoomId = Number(roomId);

      if (
        !Number.isInteger(numericRoomId) ||
        numericRoomId < 1 ||
        nights < 1 ||
        !Number.isInteger(guests) ||
        guests < 1
      ) {
        setError("The booking details are incomplete. Please select the room again.");
        setLoading(false);
        return;
      }

      if (!localStorage.getItem("accessToken")) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const [selectedRoom, user] = await Promise.all([
          getRoomById(numericRoomId),
          getCurrentUser(),
        ]);

        if (guests > selectedRoom.capacity) {
          throw new Error(
            `This room allows a maximum of ${selectedRoom.capacity} guests.`,
          );
        }

        setRoom(selectedRoom);
        setContactName(`${user.firstName} ${user.lastName}`.trim());
        setContactEmail(user.email);
        setContactPhone(user.phoneNumber ?? "");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the booking details.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCheckout();
  }, [guests, navigate, nights, roomId]);

  function continueFromGuestInformation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep(3);
  }

  async function completeBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!room) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const completedReservation = await createHotelReservation({
        roomId: room.id,
        checkIn,
        checkOut,
        guestCount: guests,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || undefined,
        paymentMethod,
      });

      setReservation(completedReservation);
      setStep(4);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not complete the booking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-100 text-gray-900">
        Loading booking details...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 lg:grid lg:grid-cols-[minmax(280px,28%)_1fr]">
      <aside className="border-b border-gray-300 bg-white px-7 py-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
        <ol className="grid gap-4 sm:grid-cols-4 lg:block">
          {stepLabels.map((label, index) => {
            const number = (index + 1) as CheckoutStep;
            const isActive = step === number;
            const isComplete = step > number;

            return (
              <li
                key={label}
                className="relative flex items-center gap-4 pb-0 lg:pb-14"
              >
                {index < stepLabels.length - 1 && (
                  <span className="absolute left-[27px] top-[56px] hidden h-[calc(100%-56px)] w-px bg-gray-300 lg:block" />
                )}

                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border text-xl font-semibold ${
                    isActive || isComplete
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {number}
                </span>

                <span
                  className={`hidden text-xl lg:block ${
                    isActive ? "font-semibold" : "font-normal"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 hidden text-center text-sm text-gray-500 lg:block">
          Hotel reservation checkout
        </p>
      </aside>

      <section className="relative px-5 py-8 sm:px-9 lg:px-12 lg:py-16 xl:px-16">
        <Link
          to="/rooms"
          className="absolute right-5 top-5 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold sm:right-9 lg:right-12 lg:top-8"
        >
          Back to rooms
        </Link>

        <div className="mx-auto max-w-5xl pt-12 lg:pt-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Step {step} of 4
          </p>
          <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">
            {stepLabels[step - 1]}
          </h1>

          {error && (
            <p className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-red-800">
              {error}
            </p>
          )}

          {!room ? (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <p>Return to the hotel screen and choose a room again.</p>
              <Link
                to="/rooms"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
              >
                Back to hotel
              </Link>
            </div>
          ) : (
            <>
              {step === 1 && (
                <section className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm">
                  <div className="grid gap-7 p-7 md:grid-cols-[minmax(260px,38%)_1fr]">
                    {room.imageUrl ? (
                      <img
                        src={room.imageUrl}
                        alt={`${room.roomType} room`}
                        className="h-52 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="grid h-52 place-items-center rounded-xl bg-stone-200">
                        No room image
                      </div>
                    )}

                    <div>
                      <h2 className="text-3xl font-semibold">
                        {room.roomType} Room
                      </h2>
                      <p className="mt-3 text-2xl font-semibold">
                        ₱{room.pricePerNight.toLocaleString()}
                        <span className="text-base font-normal"> / night</span>
                      </p>
                      <p className="mt-4 text-stone-600">Room {room.roomNumber}</p>
                    </div>

                    <dl className="grid gap-6 md:col-span-2 sm:grid-cols-3">
                      <div>
                        <dt className="text-lg font-medium">Check-in</dt>
                        <dd className="mt-3 text-xl font-semibold">{displayDate(checkIn)}</dd>
                      </div>
                      <div>
                        <dt className="text-lg font-medium">Check-out</dt>
                        <dd className="mt-3 text-xl font-semibold">{displayDate(checkOut)}</dd>
                      </div>
                      <div>
                        <dt className="text-lg font-medium">Guests</dt>
                        <dd className="mt-3 text-xl font-semibold">{guests}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col gap-5 border-t border-gray-300 bg-gray-50 p-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-2xl font-semibold">Total Amount</p>
                      <p className="mt-2 text-4xl font-bold">₱{totalAmount.toLocaleString()}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="min-w-64 rounded-lg bg-blue-600 px-10 py-3 text-lg font-semibold text-white hover:bg-blue-700"
                    >
                      Continue
                    </button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <form
                  onSubmit={continueFromGuestInformation}
                  className="rounded-xl border border-stone-300 bg-white p-7 shadow-sm"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-lg">Full name</span>
                      <input
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        maxLength={101}
                        className="w-full rounded-lg border border-stone-300 px-4 py-3"
                        required
                      />
                    </label>
                    <label>
                      <span className="mb-2 block text-lg">Email</span>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                        maxLength={100}
                        className="w-full rounded-lg border border-stone-300 px-4 py-3"
                        required
                      />
                    </label>
                    <label>
                      <span className="mb-2 block text-lg">Phone number</span>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                        pattern="[0-9]{11}"
                        maxLength={11}
                        placeholder="11 digits"
                        className="w-full rounded-lg border border-stone-300 px-4 py-3"
                        required
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="mb-2 block text-lg">Special requests (optional)</span>
                      <textarea
                        value={specialRequests}
                        onChange={(event) => setSpecialRequests(event.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="w-full rounded-lg border border-stone-300 px-4 py-3"
                      />
                    </label>
                  </div>

                  <div className="mt-7 flex flex-wrap justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-gray-300 px-7 py-3 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-10 py-3 font-semibold text-white"
                    >
                      Continue to payment
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form
                  onSubmit={completeBooking}
                  className="rounded-xl border border-stone-300 bg-white p-7 shadow-sm"
                >
                  <fieldset className="space-y-3">
                    <legend className="mb-3 text-2xl font-semibold">
                      Select payment method
                    </legend>
                    {[
                      ["pay_at_hotel", "Pay at hotel"],
                      ["credit_card", "Credit/debit card (test)"],
                      ["gcash", "GCash (test)"],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-300 p-4"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={() => setPaymentMethod(value as PaymentMethod)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </fieldset>

                  <div className="mt-7 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p>Total amount</p>
                      <p className="text-3xl font-bold">₱{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-lg border border-gray-300 px-7 py-3 font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-9 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {submitting ? "Booking..." : "Confirm booking"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {step === 4 && reservation && (
                <section className="rounded-xl border border-stone-300 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl text-green-700">
                    ✓
                  </div>
                  <h2 className="text-3xl font-semibold">Booking confirmed</h2>
                  <p className="mt-4 text-lg">
                    Reservation reference: <strong>{reservation.reservationReference}</strong>
                  </p>
                  <p className="mt-2 text-stone-600">
                    Payment status: {reservation.payment?.status ?? "pending"}
                  </p>
                  <div className="mt-7 flex justify-center">
                    <Link
                      to="/rooms"
                      className="rounded-lg border border-gray-300 px-8 py-3 font-semibold"
                    >
                      Back to hotel
                    </Link>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
