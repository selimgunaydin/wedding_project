import type { EventRecord } from "@/types/database";

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getEventUrl(event: Pick<EventRecord, "slug">) {
  return `${getBaseUrl()}/events/${event.slug}`;
}

export function getQrPosterFileName(event: Pick<EventRecord, "title" | "event_date">) {
  return `${event.title.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")}-${event.event_date}-qr`;
}
