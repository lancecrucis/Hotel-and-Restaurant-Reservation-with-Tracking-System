import { apiRequest } from "../../services/api";
import type {
  Notification,
  ReservationStatusHistory,
} from "./profile.types";

export async function getNotifications(): Promise<Notification[]> {
  const data = await apiRequest<{ notifications: Notification[] }>(
    "/notifications",
  );

  return data.notifications;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<Notification> {
  const data = await apiRequest<{ notification: Notification }>(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );

  return data.notification;
}

export async function markAllNotificationsAsRead(): Promise<
  Notification[]
> {
  const data = await apiRequest<{ notifications: Notification[] }>(
    "/notifications/read-all",
    { method: "PATCH" },
  );

  return data.notifications;
}

export async function getReservationStatusHistory(): Promise<
  ReservationStatusHistory[]
> {
  const data = await apiRequest<{
    history: ReservationStatusHistory[];
  }>("/reservation-status-history/me");

  return data.history;
}
