import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser } from "../LoginAndRegister/auth.api";
import type { User } from "../LoginAndRegister/auth.types";
import {
  cancelHotelReservation,
  getMyHotelReservations,
} from "../HotelScreen/hotelReservations.api";
import type { HotelReservation } from "../HotelScreen/hotelReservation.types";
import {
  cancelRestaurantReservation,
  getMyRestaurantReservations,
} from "../RestaurantScreen/restaurantReservations.api";
import type { RestaurantReservation } from "../RestaurantScreen/restaurantReservation.types";
import {
  getNotifications,
  getReservationStatusHistory,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./profile.api";
import type { Notification, ReservationStatusHistory } from "./profile.types";

type ProfileSection =
  | "dashboard"
  | "hotel-reservations"
  | "restaurant-reservations"
  | "payments"
  | "notifications"
  | "settings";

const navigationItems: Array<{
  id: ProfileSection;
  label: string;
}> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "hotel-reservations", label: "Hotel Reservations" },
  { id: "restaurant-reservations", label: "Restaurant Reservations" },
  { id: "payments", label: "Payment History" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Profile Settings" },
];

function initialSection(): ProfileSection {
  const hash = window.location.hash.slice(1) as ProfileSection;
  return navigationItems.some((item) => item.id === hash)
    ? hash
    : "dashboard";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function statusClass(status: string) {
  return status === "cancelled" || status === "failed"
    ? "bg-gray-300 text-gray-800"
    : "bg-gray-100 text-gray-700";
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl font-semibold sm:text-4xl">{children}</h1>;
}

export default function Profile() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ProfileSection>(initialSection);
  const [user, setUser] = useState<User | null>(null);
  const [hotelReservations, setHotelReservations] = useState<HotelReservation[]>([]);
  const [restaurantReservations, setRestaurantReservations] =
    useState<RestaurantReservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [statusHistory, setStatusHistory] = useState<ReservationStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!localStorage.getItem("accessToken")) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const [profile, hotels, restaurants, userNotifications, history] =
          await Promise.all([
            getCurrentUser(),
            getMyHotelReservations(),
            getMyRestaurantReservations(),
            getNotifications(),
            getReservationStatusHistory(),
          ]);

        setUser(profile);
        setHotelReservations(hotels);
        setRestaurantReservations(restaurants);
        setNotifications(userNotifications);
        setStatusHistory(history);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load the profile.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [navigate]);

  async function refreshActivity() {
    const [userNotifications, history] = await Promise.all([
      getNotifications(),
      getReservationStatusHistory(),
    ]);
    setNotifications(userNotifications);
    setStatusHistory(history);
  }

  async function handleCancelHotel(reservationId: number) {
    try {
      setMessage("");
      const updated = await cancelHotelReservation(reservationId);
      setHotelReservations((current) =>
        current.map((reservation) =>
          reservation.id === updated.id ? updated : reservation,
        ),
      );
      await refreshActivity();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel the hotel reservation.");
    }
  }

  async function handleCancelRestaurant(reservationId: number) {
    try {
      setMessage("");
      const updated = await cancelRestaurantReservation(reservationId);
      setRestaurantReservations((current) =>
        current.map((reservation) =>
          reservation.id === updated.id ? updated : reservation,
        ),
      );
      await refreshActivity();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel the restaurant reservation.");
    }
  }

  async function handleMarkNotificationAsRead(notificationId: number) {
    try {
      const updated = await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === updated.id ? updated : notification,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the notification.");
    }
  }

  async function handleMarkAllNotificationsAsRead() {
    try {
      setNotifications(await markAllNotificationsAsRead());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update notifications.");
    }
  }

  function selectSection(section: ProfileSection) {
    setActiveSection(section);
    window.history.replaceState(null, "", `#${section}`);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-gray-100">Loading profile...</main>;
  }

  const upcomingHotel = hotelReservations.find(
    (reservation) => reservation.status === "confirmed",
  );
  const upcomingRestaurant = restaurantReservations.find(
    (reservation) => reservation.status === "confirmed",
  );
  const payments = hotelReservations.flatMap((reservation) =>
    reservation.payment
      ? [{ reservation, payment: reservation.payment }]
      : [],
  );
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-gray-300 bg-white px-4 py-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
        <Link to="/rooms" className="text-lg font-semibold">Back</Link>

        <nav aria-label="Profile sections" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-0 md:grid-cols-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectSection(item.id)}
              className={`flex min-w-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm md:text-base ${
                activeSection === item.id
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{item.label}</span>
              {item.id === "notifications" && notifications.some((notification) => !notification.isRead) && (
                <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold">
                  {notifications.filter((notification) => !notification.isRead).length}
                </span>
              )}
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 md:text-base"
          >
            Log out
          </button>
        </nav>
      </aside>

      <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-12">
        {message && <p className="mb-5 rounded-lg bg-amber-100 p-3 text-amber-900">{message}</p>}

        {activeSection === "dashboard" && (
          <div>
            <div className="mb-8">
              <SectionTitle>Welcome, {user?.firstName} {user?.lastName}</SectionTitle>
              <p className="mt-2 text-lg">Here is a quick overview of your reservations.</p>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-lg border border-gray-300 bg-white p-5">
                <h2 className="text-2xl font-semibold">Upcoming Stay</h2>
                {upcomingHotel ? (
                  <>
                    <p className="mt-4">{formatDate(upcomingHotel.checkIn)} – {formatDate(upcomingHotel.checkOut)}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p>{upcomingHotel.room.roomType} Room</p>
                      <span className={`rounded-full px-3 py-1 text-sm capitalize ${statusClass(upcomingHotel.status)}`}>{upcomingHotel.status}</span>
                    </div>
                    <button type="button" onClick={() => selectSection("hotel-reservations")} className="mt-5 w-full rounded bg-blue-600 px-5 py-3 font-semibold text-white">View Details</button>
                  </>
                ) : (
                  <p className="mt-4 text-stone-500">No upcoming hotel stay.</p>
                )}
              </article>

              <article className="rounded-lg border border-gray-300 bg-white p-5">
                <h2 className="text-2xl font-semibold">Upcoming Restaurant Reservation</h2>
                {upcomingRestaurant ? (
                  <>
                    <p className="mt-4">{formatDate(upcomingRestaurant.reservationDate)} | {formatTime(upcomingRestaurant.startTime)}–{formatTime(upcomingRestaurant.endTime)}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p>{upcomingRestaurant.guestCount} Guests · Table {upcomingRestaurant.table.tableNumber}</p>
                      <span className={`rounded-full px-3 py-1 text-sm capitalize ${statusClass(upcomingRestaurant.status)}`}>{upcomingRestaurant.status}</span>
                    </div>
                    <button type="button" onClick={() => selectSection("restaurant-reservations")} className="mt-5 w-full rounded bg-blue-600 px-5 py-3 font-semibold text-white">View Details</button>
                  </>
                ) : (
                  <p className="mt-4 text-stone-500">No upcoming restaurant reservation.</p>
                )}
              </article>
            </div>

            <article className="mt-6 rounded-lg border border-gray-300 bg-white p-5">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              {notifications.length === 0 ? (
                <p className="mt-4 text-stone-500">No activity yet.</p>
              ) : (
                <div className="mt-3 divide-y divide-stone-400">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <p>{notification.title}</p>
                      <time className="text-sm text-stone-500">{formatDateTime(notification.createdAt)}</time>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}

        {activeSection === "hotel-reservations" && (
          <div>
            <SectionTitle>Hotel Reservations</SectionTitle>
            {hotelReservations.length === 0 ? (
              <p className="mt-5">No hotel reservations yet.</p>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {hotelReservations.map((reservation) => (
                  <article key={reservation.id} className="rounded-xl border border-stone-300 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold">{reservation.room.roomType} · Room {reservation.room.roomNumber}</h2>
                      <span className={`rounded-full px-3 py-1 text-sm capitalize ${statusClass(reservation.status)}`}>{reservation.status}</span>
                    </div>
                    <p className="mt-3">{formatDate(reservation.checkIn)} to {formatDate(reservation.checkOut)}</p>
                    <p>Guests: {reservation.guestCount}</p>
                    <p>Total: ₱{reservation.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-stone-500">Reference: {reservation.reservationReference}</p>
                    {reservation.status === "confirmed" && (
                      <button type="button" onClick={() => void handleCancelHotel(reservation.id)} className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white">Cancel reservation</button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "restaurant-reservations" && (
          <div>
            <SectionTitle>Restaurant Reservations</SectionTitle>
            {restaurantReservations.length === 0 ? (
              <p className="mt-5">No restaurant reservations yet.</p>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {restaurantReservations.map((reservation) => (
                  <article key={reservation.id} className="rounded-xl border border-stone-300 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold">Table {reservation.table.tableNumber}</h2>
                      <span className={`rounded-full px-3 py-1 text-sm capitalize ${statusClass(reservation.status)}`}>{reservation.status}</span>
                    </div>
                    <p className="mt-3">Date: {formatDate(reservation.reservationDate)}</p>
                    <p>Time: {formatTime(reservation.startTime)} to {formatTime(reservation.endTime)}</p>
                    <p>Guests: {reservation.guestCount}</p>
                    <p className="text-sm text-stone-500">Reference: {reservation.reservationReference}</p>
                    {reservation.status === "confirmed" && (
                      <button type="button" onClick={() => void handleCancelRestaurant(reservation.id)} className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white">Cancel reservation</button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "payments" && (
          <div>
            <SectionTitle>Payment History</SectionTitle>
            {payments.length === 0 ? (
              <p className="mt-5">No payment records yet.</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl border border-stone-300 bg-white">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="bg-stone-100"><tr><th className="p-4">Reference</th><th className="p-4">Reservation</th><th className="p-4">Method</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr></thead>
                  <tbody className="divide-y divide-stone-200">
                    {payments.map(({ reservation, payment }) => (
                      <tr key={payment.id}>
                        <td className="p-4">{payment.transactionReference}</td>
                        <td className="p-4">{reservation.reservationReference}</td>
                        <td className="p-4 capitalize">{payment.method.replaceAll("_", " ")}</td>
                        <td className="p-4">₱{payment.amount.toLocaleString()}</td>
                        <td className="p-4"><span className={`rounded-full px-3 py-1 text-sm capitalize ${statusClass(payment.status)}`}>{payment.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === "notifications" && (
          <div>
            <div className="flex items-center justify-between gap-4">
              <SectionTitle>Notifications</SectionTitle>
              {notifications.some((notification) => !notification.isRead) && (
                <button type="button" onClick={() => void handleMarkAllNotificationsAsRead()} className="rounded bg-gray-700 px-4 py-2 text-sm font-semibold text-white">Mark all as read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="mt-5">No notifications yet.</p>
            ) : (
              <div className="mt-6 grid gap-3">
                {notifications.map((notification) => (
                  <article key={notification.id} className={`rounded-lg border p-4 ${notification.isRead ? "border-gray-300 bg-white" : "border-blue-300 bg-blue-50"}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-semibold">{notification.title}</h2>
                        <p>{notification.message}</p>
                        <p className="mt-1 text-sm text-stone-500">{formatDateTime(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <button type="button" onClick={() => void handleMarkNotificationAsRead(notification.id)} className="shrink-0 rounded border border-gray-400 px-3 py-2 text-sm">Mark as read</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <h2 className="mt-10 text-xl font-semibold">Reservation Status History</h2>
            {statusHistory.length === 0 ? (
              <p className="mt-3">No status history yet.</p>
            ) : (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {statusHistory.map((history) => (
                  <article key={history.id} className="rounded-lg border border-stone-300 bg-white p-4">
                    <p className="font-semibold">{history.reservationReference}</p>
                    <p className="capitalize">{history.reservationType}: {history.previousStatus || "created"} → {history.newStatus}</p>
                    <p className="text-sm text-stone-500">{formatDateTime(history.changedAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "settings" && (
          <div>
            <SectionTitle>Profile Settings</SectionTitle>
            {user ? (
              <div className="mt-6 grid gap-5 rounded-xl border border-stone-300 bg-white p-6 sm:grid-cols-2">
                <div><p className="text-sm text-stone-500">Full name</p><p className="font-semibold">{user.firstName} {user.lastName}</p></div>
                <div><p className="text-sm text-stone-500">Email</p><p className="break-all font-semibold">{user.email}</p></div>
                <div><p className="text-sm text-stone-500">Phone</p><p className="font-semibold">{user.phoneNumber || "Not provided"}</p></div>
                <div><p className="text-sm text-stone-500">Date of birth</p><p className="font-semibold">{user.dateOfBirth ? formatDate(user.dateOfBirth) : "Not provided"}</p></div>
              </div>
            ) : (
              <p className="mt-5">Profile unavailable. <Link to="/login" className="underline">Log in again.</Link></p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
