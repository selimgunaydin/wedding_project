import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
