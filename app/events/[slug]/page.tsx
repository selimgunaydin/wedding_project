import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heart, UploadCloud } from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { getEventBySlug } from "@/lib/db";
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
    <main className="min-h-screen overflow-hidden floral-frame px-4 py-4 md:grid md:place-items-center md:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <section className="mb-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-copper/25 bg-white/70 px-3 py-1.5 text-sm text-muted-foreground shadow-line backdrop-blur">
            <UploadCloud className="h-4 w-4 text-copper" />
            Anılarınızı bizimle paylaşın
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{event.title}</h1>
          <p className="font-script text-5xl leading-none text-copper md:text-6xl">birlikte biriktirelim</p>
          <div className="copper-line mx-auto mt-3 h-px w-40" />
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Çektiğiniz fotoğraf ve videoları buradan hızlıca yükleyebilirsiniz.
          </p>
        </section>

        <UploadDropzone eventSlug={event.slug} />

        <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-rose" />
          Paylaştığınız her an bizim için çok değerli.
        </p>
      </div>
    </main>
  );
}
