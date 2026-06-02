import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/format";

export function Footer({ events }: { events: EventRecord[] }) {
  return (
    <footer className="border-t border-border bg-white/45">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-semibold">{APP_NAME}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Bu özel günlerde çekilen fotoğraf ve videoları zarif, güvenli ve düzenli bir alanda topluyoruz.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Etkinlikler</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="hover:text-foreground">
                {event.title} · {formatDate(event.event_date)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Bağlantılar</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/qr" className="hover:text-foreground">
              QR kodlar
            </Link>
            <Link href="/events" className="hover:text-foreground">
              Fotoğraf paylaş
            </Link>
            <Link href="/admin/login" className="hover:text-foreground">
              Admin giriş
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
