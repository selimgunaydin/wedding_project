import Link from "next/link";
import { ArrowRight, CalendarDays, Camera, Clock, MapPin, Sparkles, UploadCloud } from "lucide-react";
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
    <main className="min-h-screen overflow-hidden floral-frame px-4 py-4 md:grid md:place-items-center md:py-6">
      <section className="relative border-b border-copper/20 px-4 py-8 md:grid md:min-h-screen md:place-items-center md:py-10">
        <div className="mx-auto w-full max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-copper/25 bg-white/70 px-3 py-1.5 text-sm text-muted-foreground shadow-line backdrop-blur">
              <Sparkles className="h-4 w-4 text-copper" />
              Dijital davetiyemiz
          </div>

          <h1 className="mt-3 font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Anılarımızı
            <span className="block font-script text-6xl font-normal leading-none text-copper md:text-8xl">
              birlikte biriktirelim
            </span>
          </h1>
          <div className="copper-line mx-auto mt-4 h-px w-44" />
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Bu özel günlerde çektiğiniz fotoğraf ve videoları tek bir zarif davetiye akışında toplayalım.
          </p>

          {primaryEvent && primarySchedule ? (
            <div className="paper-surface mx-auto mt-7 max-w-xl rounded-[18px] border border-white/70 p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-rose" />
                  {primaryEvent.title}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sage" />
                  {formatLongDate(primaryEvent.event_date)} · {primarySchedule.time}
                </span>
              </div>
              <div className="mx-auto max-w-xl">
                <EventCountdown startsAt={primarySchedule.startsAt} />
              </div>
            </div>
          ) : null}

          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            {primaryEvent ? (
              <ButtonLink
                href={`/events/${primaryEvent.slug}`}
                size="md"
                className="min-h-[40px] flex-1 px-6 py-4 text-[15px] leading-none shadow-soft"
              >
                <UploadCloud className="h-5 w-5" />
                Anı Yükle
              </ButtonLink>
            ) : null}
            <ButtonLink
              href="#gunlerimiz"
              size="md"
              variant="outline"
              className="min-h-[40px] flex-1 px-6 py-4 text-[15px] leading-none shadow-soft"
            >
              Tarihleri Gör
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="gunlerimiz" className="container-shell py-10 md:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground shadow-line">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl">Günlerimiz</h2>
          <div className="copper-line mx-auto mt-3 h-px w-32" />
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
            Her gün için ayrı yükleme alanı var. QR kod sizi doğru sayfaya götürür; isterseniz buradan da anı
            paylaşabilirsiniz.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {events.map((event) => {
            const schedule = getEventSchedule(event);

            return (
              <article key={event.id} className="paper-surface rounded-[18px] border border-white/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-rose">{formatLongDate(event.event_date)}</p>
                    <h3 className="mt-2 font-serif text-3xl">{event.title}</h3>
                  </div>
                  <span className="rounded-full border border-border bg-champagne/70 px-3 py-1 text-sm text-muted-foreground">
                    {schedule?.time ?? "19.00"}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">{event.description}</p>

                {schedule?.shortNote ? (
                  <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                    <span>{schedule.shortNote}</span>
                  </p>
                ) : null}

                {schedule ? (
                  <div className="mt-5">
                    <EventCountdown startsAt={schedule.startsAt} compact />
                  </div>
                ) : null}

                <Link
                  href={`/events/${event.slug}`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-line transition hover:bg-ink"
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

      <section className="border-t border-copper/20 bg-white/35 py-10">
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
