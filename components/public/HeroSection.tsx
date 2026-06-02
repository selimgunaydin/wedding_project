import Image from "next/image";
import { CalendarDays, Images, QrCode } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { EventRecord } from "@/types/database";
import { formatDate } from "@/lib/format";

export function HeroSection({ events }: { events: EventRecord[] }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(233,220,199,0.72))]">
      <div className="container-shell grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 md:grid-cols-[0.95fr_1.05fr] md:py-12">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm text-muted-foreground shadow-line">
            <CalendarDays className="h-4 w-4 text-rose" />
            2026 yazının en güzel anıları
          </div>
          <h1 className="font-serif text-5xl leading-[1.03] text-foreground md:text-7xl">
            En Güzel Anlarımızı Birlikte Biriktirelim
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Bu özel günlerde çektiğiniz fotoğraf ve videoları QR kod ile kolayca bizimle paylaşabilirsiniz.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/events" size="lg">
              <Images className="h-5 w-5" />
              Etkinlikleri Gör
            </ButtonLink>
            <ButtonLink href={`/events/${events[0]?.slug ?? ""}`} size="lg" variant="outline">
              Fotoğraf Paylaş
            </ButtonLink>
            <ButtonLink href="/qr" size="lg" variant="secondary">
              <QrCode className="h-5 w-5" />
              QR Kodlar
            </ButtonLink>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 text-sm">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-border bg-white/55 p-3">
                <p className="font-medium">{formatDate(event.event_date)}</p>
                <p className="mt-1 text-muted-foreground">{event.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-white/70 bg-white/50 shadow-soft md:min-h-[560px]">
          <Image
            src="/images/hero-memory-share.png"
            alt="QR kod ile anı paylaşımını anlatan zarif masa kompozisyonu"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              QR kodu okutun, anınızı seçin ve yükleyin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
