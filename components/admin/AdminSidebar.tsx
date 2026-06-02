import Link from "next/link";
import { CalendarDays, LayoutDashboard, LogOut, UploadCloud } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Etkinlikler", icon: CalendarDays },
  { href: "/admin/uploads", label: "Yüklemeler", icon: UploadCloud }
];

export function AdminSidebar() {
  return (
    <aside className="print-hidden border-r border-border bg-white/60 p-4 md:min-h-screen">
      <Link href="/admin" className="mb-6 flex items-center gap-2 font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">A</span>
        {APP_NAME}
      </Link>

      <nav className="grid gap-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <form action="/api/admin/logout" method="post" className="mt-6">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Çıkış
        </button>
      </form>
    </aside>
  );
}
