import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { getEventBySlug } from "@/lib/db";
import { formatLongDate } from "@/lib/format";
import { buildEventMetadata, buildPageMetadata } from "@/lib/metadata";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return buildPageMetadata({
      title: "Fotoğraf ve Video Yükleme",
      path: `/events/${slug}`,
      noIndex: true
    });
  }

  return buildEventMetadata(event);
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen px-4 py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <section className="mb-5 rounded-xl border border-border bg-white/65 p-5 shadow-line md:p-6">
          <p className="text-sm font-medium uppercase text-rose">{formatLongDate(event.event_date)}</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{event.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Hoş geldiniz. Çektiğiniz fotoğraf ve videoları buradan bizimle paylaşabilirsiniz.
          </p>
        </section>

        <UploadDropzone eventSlug={event.slug} />
      </div>
    </main>
  );
}
