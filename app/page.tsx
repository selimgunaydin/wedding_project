import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Camera, Clock, Heart, UploadCloud } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EventCountdown } from "@/components/invitation/EventCountdown";
import { APP_NAME } from "@/lib/constants";
import { getEvents } from "@/lib/db";
import { getEventSchedule } from "@/lib/event-schedule";
import { formatLongDate } from "@/lib/format";

export default async function HomePage() {
  const events = await getEvents();
  const primaryEvent = events[0];
  const primarySchedule = primaryEvent ? getEventSchedule(primaryEvent) : null;

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative border-b border-border">
        <div className="container-shell grid min-h-screen items-center gap-8 py-8 md:grid-cols-[0.92fr_1.08fr] md:py-12">
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/65 px-3 py-1.5 text-sm text-muted-foreground shadow-line">
              <Heart className="h-4 w-4 text-rose" />
              Dijital davetiyemiz
            </div>

            <p className="text-sm font-medium uppercase text-sage">Nişan ve düğün günlerimiz</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.04] text-foreground md:text-7xl">
              Anılarımızı birlikte biriktirelim
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Bu özel günlerde çektiğiniz fotoğraf ve videoları bizimle paylaşmanız bizi çok mutlu eder.
            </p>

            {primaryEvent && primarySchedule ? (
              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-rose" />
                    {primaryEvent.title}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sage" />
                    {formatLongDate(primaryEvent.event_date)} · {primarySchedule.time}
                  </span>
                </div>
                <EventCountdown startsAt={primarySchedule.startsAt} />
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryEvent ? (
                <ButtonLink href={`/events/${primaryEvent.slug}`} size="lg">
                  <UploadCloud className="h-5 w-5" />
                  Anı Yükle
                </ButtonLink>
              ) : null}
              <ButtonLink href="#gunlerimiz" size="lg" variant="outline">
                Tarihleri Gör
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/70 bg-white/50 shadow-soft md:min-h-[660px]">
            <Image
              src="/images/hero.png"
              alt="Anı paylaşımı için zarif davetiye kompozisyonu"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-5">
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                QR kodu açın, etkinlik sayfasına girin ve çektiğiniz anları bizimle paylaşın.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="gunlerimiz" className="container-shell py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl">Günlerimiz</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Her gün için ayrı yükleme alanı var. QR kod sizi doğru sayfaya götürür; isterseniz buradan da anı
            paylaşabilirsiniz.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {events.map((event) => {
            const schedule = getEventSchedule(event);

            return (
              <article key={event.id} className="rounded-xl border border-border bg-white/65 p-5 shadow-line">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-rose">{formatLongDate(event.event_date)}</p>
                    <h3 className="mt-2 font-serif text-3xl">{event.title}</h3>
                  </div>
                  <span className="rounded-full border border-border bg-champagne/70 px-3 py-1 text-sm text-muted-foreground">
                    {schedule?.time ?? "19.00"}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                  {schedule?.shortNote ?? event.description}
                </p>

                {schedule ? (
                  <div className="mt-5">
                    <EventCountdown startsAt={schedule.startsAt} compact />
                  </div>
                ) : null}

                <Link
                  href={`/events/${event.slug}`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-ink"
                >
                  <Camera className="h-4 w-4" />
                  Fotoğraf ve video yükle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-white/35 py-10">
        <div className="container-shell flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <p className="font-semibold">{APP_NAME}</p>
            <p className="mt-1 text-sm text-muted-foreground">Paylaştığınız her an bizim için çok değerli.</p>
          </div>
          <p className="text-sm text-muted-foreground">Teşekkür ederiz.</p>
        </div>
      </section>
    </main>
  );
}
