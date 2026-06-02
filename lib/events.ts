import type { EventRecord } from "@/types/database";

const now = new Date("2026-01-01T00:00:00.000Z").toISOString();

export const seedEvents: EventRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Nişan",
    slug: "nisan-21-06-2026",
    event_type: "engagement",
    event_date: "2026-06-21",
    description:
      "Bu ilk kutlamada yakaladığınız zarif anları bizimle paylaşın; her kare bu hikayeyi biraz daha büyütecek.",
    cover_image_url: null,
    is_active: true,
    created_at: now,
    updated_at: now
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "1. Düğün",
    slug: "dugun-1-02-08-2026",
    event_type: "wedding_1",
    event_date: "2026-08-02",
    description:
      "Sevdiklerimizle bir araya geldiğimiz bu özel günden fotoğraf ve videolarınızı bekliyoruz.",
    cover_image_url: null,
    is_active: true,
    created_at: now,
    updated_at: now
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "2. Düğün",
    slug: "dugun-2-29-08-2026",
    event_type: "wedding_2",
    event_date: "2026-08-29",
    description:
      "Kutlamamızın ikinci buluşmasında gördüğünüz en güzel anları tek yerde toplayalım.",
    cover_image_url: null,
    is_active: true,
    created_at: now,
    updated_at: now
  }
];

export function getSeedEventBySlug(slug: string) {
  return seedEvents.find((event) => event.slug === slug) ?? null;
}

export function getSeedEventById(id: string) {
  return seedEvents.find((event) => event.id === id) ?? null;
}
