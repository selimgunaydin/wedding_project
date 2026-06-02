import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getEvents, getUploads } from "@/lib/db";
import { formatDate, formatBytes } from "@/lib/format";

export const metadata = {
  title: "Admin Etkinlikler"
};

export default async function AdminEventsPage() {
  const [events, uploads] = await Promise.all([getEvents(), getUploads()]);

  return (
    <div>
      <AdminHeader
        title="Etkinlikler"
        description="Her etkinliğin yükleme ve onay durumunu ayrı yönetin."
        email={process.env.ADMIN_EMAIL || "admin"}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => {
          const eventUploads = uploads.filter((upload) => upload.event_slug === event.slug);

          return (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="rounded-xl border border-border bg-white/70 p-5 shadow-line transition hover:bg-white">
              <CalendarDays className="h-5 w-5 text-rose" />
              <h2 className="mt-4 font-serif text-2xl">{event.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(event.event_date)}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{event.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                <span className="rounded-lg bg-muted p-3">Toplam: {eventUploads.length}</span>
                <span className="rounded-lg bg-muted p-3">
                  Bekleyen: {eventUploads.filter((upload) => upload.status === "pending").length}
                </span>
                <span className="rounded-lg bg-muted p-3">
                  Onaylı: {eventUploads.filter((upload) => upload.status === "approved").length}
                </span>
                <span className="rounded-lg bg-muted p-3">
                  Alan: {formatBytes(eventUploads.reduce((sum, upload) => sum + upload.file_size, 0))}
                </span>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm font-medium">
                Medyaları yönet
                <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
