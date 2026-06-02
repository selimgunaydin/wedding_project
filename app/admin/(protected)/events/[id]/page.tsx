import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MediaManager } from "@/components/admin/MediaManager";
import { getEventById, getUploads } from "@/lib/db";
import { formatLongDate } from "@/lib/format";

type AdminEventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AdminEventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  return {
    title: event ? `${event.title} Yönetimi` : "Etkinlik Yönetimi"
  };
}

export default async function AdminEventDetailPage({ params }: AdminEventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const uploads = await getUploads({ eventSlug: event.slug });

  return (
    <div>
      <AdminHeader
        title={`${event.title} medya yönetimi`}
        description={`${formatLongDate(event.event_date)} etkinliği için yüklemeler.`}
        email={process.env.ADMIN_EMAIL || "admin"}
      />
      <MediaManager uploads={uploads} eventSlug={event.slug} />
    </div>
  );
}
