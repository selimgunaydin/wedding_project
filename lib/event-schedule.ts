import type { EventRecord } from "@/types/database";

export const eventSchedule: Record<
  string,
  {
    time: string;
    startsAt: string;
    shortNote: string;
  }
> = {
  "nisan-21-06-2026": {
    time: "19.00",
    startsAt: "2026-06-21T19:00:00+03:00",
    shortNote: "Hayat Parkı Davet Salonu Halkalı Merkez Mah. Eski Bağlar Cad. Küçükçekmece / İstanbul"
  },
  "dugun-1-02-08-2026": {
    time: "19.00",
    startsAt: "2026-08-02T19:00:00+03:00",
    shortNote: "BANQUET DELUXE BAHÇEŞEHİR İş Mekan Plaza, Tahtakale, Fırat Cd. No:2 Avcılar / İstanbul"
  },
  "dugun-2-29-08-2026": {
    time: "19.00",
    startsAt: "2026-08-29T19:00:00+03:00",
    shortNote: "Remzi Blue Söğütlü, Mersinlik Cd. No:19, 61300 Söğütlü/Trabzon"
  }
};

export function getEventSchedule(event: Pick<EventRecord, "slug">) {
  return eventSchedule[event.slug];
}
