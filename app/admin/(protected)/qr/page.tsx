import { AdminHeader } from "@/components/admin/AdminHeader";
import { QRCodeCard } from "@/components/qr/QRCodeCard";
import { getEvents } from "@/lib/db";
import { getEventUrl } from "@/lib/qr";

export const metadata = {
  title: "Admin QR Kodlar"
};

export default async function AdminQRPage() {
  const events = await getEvents();

  return (
    <div>
      <AdminHeader
        title="QR Kodlar"
        description="Davetiyeye veya masalara koyacağınız etkinlik QR kodlarını buradan indirin."
        email={process.env.ADMIN_EMAIL || "admin"}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <QRCodeCard key={event.id} event={event} url={getEventUrl(event)} printHref={`/admin/qr/${event.slug}?print=1`} />
        ))}
      </div>
    </div>
  );
}
