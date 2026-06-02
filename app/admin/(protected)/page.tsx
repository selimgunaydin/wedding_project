import { CalendarDays, Database, HardDrive, ImageIcon, ListChecks, UploadCloud, Video } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminStats } from "@/lib/db";
import { formatBytes } from "@/lib/format";

export const metadata = {
  title: "Admin Dashboard"
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Yüklenen medya, onay durumu ve etkinlik bazlı kullanım özeti."
        email={process.env.ADMIN_EMAIL || "admin"}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam etkinlik" value={stats.totalEvents} icon={CalendarDays} />
        <StatCard title="Toplam yükleme" value={stats.totalUploads} icon={UploadCloud} />
        <StatCard title="Bekleyen medya" value={stats.pendingUploads} icon={ListChecks} />
        <StatCard title="Onaylı medya" value={stats.approvedUploads} icon={Database} />
        <StatCard title="Kullanılan storage" value={formatBytes(stats.totalStorageBytes)} icon={HardDrive} />
        <StatCard title="Fotoğraf sayısı" value={stats.imageCount} icon={ImageIcon} />
        <StatCard title="Video sayısı" value={stats.videoCount} icon={Video} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Etkinlik bazlı özet</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {stats.byEvent.map((item) => (
            <article key={item.event.id} className="rounded-xl border border-border bg-white/70 p-5 shadow-line">
              <p className="font-serif text-2xl">{item.event.title}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Toplam</p>
                  <p className="mt-1 text-lg font-semibold">{item.total}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Bekleyen</p>
                  <p className="mt-1 text-lg font-semibold">{item.pending}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Onaylı</p>
                  <p className="mt-1 text-lg font-semibold">{item.approved}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-muted-foreground">Alan</p>
                  <p className="mt-1 text-lg font-semibold">{formatBytes(item.storageBytes)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
