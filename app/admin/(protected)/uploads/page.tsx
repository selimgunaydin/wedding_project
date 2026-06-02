import { AdminHeader } from "@/components/admin/AdminHeader";
import { MediaManager } from "@/components/admin/MediaManager";
import { getUploads } from "@/lib/db";

export const metadata = {
  title: "Tüm Yüklemeler"
};

export default async function AdminUploadsPage() {
  const uploads = await getUploads();

  return (
    <div>
      <AdminHeader
        title="Tüm yüklemeler"
        description="Etkinliklerden gelen fotoğraf ve videoları tek ekrandan yönetin."
        email={process.env.ADMIN_EMAIL || "admin"}
      />
      <MediaManager uploads={uploads} />
    </div>
  );
}
