import { apiFetch } from "@/api/client";

export const EVENT_CATEGORIES = [
  { value: "REGULAR_MEETING", label: "정기회의", defaultXp: 3 },
  { value: "EVENT", label: "행사", defaultXp: 5 },
  { value: "STUDY", label: "스터디", defaultXp: 5 },
  { value: "LAB", label: "Lab", defaultXp: 5 },
  { value: "STAFF", label: "스태프", defaultXp: 2 },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];

export interface AdminEvent {
  eventId: number;
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  category?: string;
  eventCategory?: string;
  hostNickname?: string;
}

export interface EventPayload {
  title: string;
  eventDate: string;
  rewardXp: number;
  location: string;
  eventCategory: EventCategory;
}

export function getEventsByMonth(year: number, month: number) {
  return apiFetch<AdminEvent[]>(`/api/event/monthly?year=${year}&month=${month}`);
}

export function getAdminEvent(eventId: number) {
  return apiFetch<AdminEvent>(`/api/admin/event/${eventId}`);
}

export function createAdminEvent(payload: EventPayload) {
  return apiFetch<AdminEvent>("/api/admin/event", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminEvent(eventId: number, payload: EventPayload) {
  return apiFetch<AdminEvent>(`/api/admin/event/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminEvent(eventId: number) {
  return apiFetch<void>(`/api/admin/event/${eventId}`, { method: "DELETE" });
}

export function getEventCategory(event: AdminEvent) {
  return event.eventCategory ?? event.category ?? "EVENT";
}

export function getEventCategoryLabel(category: string) {
  return EVENT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
