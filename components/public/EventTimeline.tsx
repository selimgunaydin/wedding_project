import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/format";

export function EventTimeline({ events }: { events: EventRecord[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {events.map((event, index) => (
        <div key={event.id} className="relative rounded-xl border border-border bg-white/55 p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            {index + 1}
          </div>
          <p className="font-medium">{event.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(event.event_date)}</p>
        </div>
      ))}
    </div>
  );
}
