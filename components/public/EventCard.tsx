import { ArrowRight, CalendarDays, QrCode } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { EventRecord } from "@/types/database";
import { formatLongDate } from "@/lib/format";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <article className="rounded-xl border border-border bg-white/62 p-5 shadow-line transition hover:-translate-y-0.5 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-rose" />
            {formatLongDate(event.event_date)}
          </p>
          <h3 className="mt-3 font-serif text-2xl">{event.title}</h3>
        </div>
        <span className="rounded-full border border-border bg-champagne/70 px-3 py-1 text-xs text-muted-foreground">
          {event.event_type === "engagement" ? "Nişan" : "Düğün"}
        </span>
      </div>
      <p className="mt-4 min-h-20 text-sm leading-6 text-muted-foreground">{event.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <ButtonLink href={`/events/${event.slug}`} size="sm">
          Sayfaya Git
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <ButtonLink href={`/qr/${event.slug}`} size="sm" variant="outline">
          <QrCode className="h-4 w-4" />
          QR Kodu Gör
        </ButtonLink>
      </div>
    </article>
  );
}
