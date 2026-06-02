import { ArrowLeft, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Footer } from "@/components/public/Footer";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { Navbar } from "@/components/public/Navbar";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { getApprovedUploadsByEventSlug, getEventBySlug, getEvents } from "@/lib/db";
import { formatLongDate } from "@/lib/format";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return {
    title: event ? event.title : "Etkinlik"
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, events] = await Promise.all([getEventBySlug(slug), getEvents()]);
  if (!event) notFound();

  const uploads = await getApprovedUploadsByEventSlug(event.slug, 18);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-border bg-white/35">
          <div className="container-shell py-10 md:py-14">
            <ButtonLink href="/events" variant="ghost" size="sm" className="mb-5">
              <ArrowLeft className="h-4 w-4" />
              Etkinliklere dön
            </ButtonLink>
            <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-end">
              <div>
                <p className="text-sm font-medium uppercase text-rose">{formatLongDate(event.event_date)}</p>
                <h1 className="mt-3 font-serif text-5xl">{event.title}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Hoş geldiniz. {event.description} Katkınız için şimdiden teşekkür ederiz.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-medium">Yükleme kuralları</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                  <li>Fotoğraflar: JPG, PNG, WebP</li>
                  <li>Videolar: MP4, MOV, WebM</li>
                  <li>Tek seferde en fazla 10 dosya</li>
                  <li>Galeriye yalnızca onaylananlar eklenir</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
          <div>
            <UploadDropzone eventSlug={event.slug} />
          </div>
          <aside className="h-fit rounded-xl border border-border bg-white/70 p-5">
            <QrCode className="h-6 w-6 text-rose" />
            <h2 className="mt-4 text-lg font-semibold">Bu etkinliğin QR kodu</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Baskı veya paylaşım için etkinliğe özel QR kodunu görüntüleyebilirsiniz.
            </p>
            <ButtonLink href={`/qr/${event.slug}`} variant="secondary" className="mt-4 w-full">
              QR kodu gör
            </ButtonLink>
          </aside>
        </section>

        <section className="container-shell pb-16">
          <div className="mb-6">
            <h2 className="font-serif text-3xl">Onaylanan anılar</h2>
            <p className="mt-2 text-sm text-muted-foreground">Yüklenen medya admin onayından sonra burada görünür.</p>
          </div>
          <GalleryGrid uploads={uploads} />
        </section>
      </main>
      <Footer events={events} />
    </>
  );
}
