import Link from "next/link";
import { Camera, QrCode } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-normal">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-4 w-4" />
          </span>
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/events" className="transition hover:text-foreground">
            Etkinlikler
          </Link>
          <Link href="/qr" className="transition hover:text-foreground">
            QR Kodlar
          </Link>
          <Link href="/admin/login" className="transition hover:text-foreground">
            Admin
          </Link>
        </nav>

        <ButtonLink href="/events" size="sm" className="hidden md:inline-flex">
          <QrCode className="h-4 w-4" />
          Fotoğraf Paylaş
        </ButtonLink>
      </div>
    </header>
  );
}
