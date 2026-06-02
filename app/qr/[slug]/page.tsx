import { ArrowLeft, Printer } from "lucide-react";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { QRPrintCard } from "@/components/qr/QRPrintCard";
import { getEventBySlug } from "@/lib/db";
import { getEventUrl } from "@/lib/qr";

type QRDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ print?: string }>;
};

export async function generateMetadata({ params }: QRDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  return {
    title: event ? `${event.title} QR Kodu` : "QR Kodu"
  };
}

export default async function QRDetailPage({ params, searchParams }: QRDetailPageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen bg-background py-6">
      <div className="print-hidden container-shell mb-5 flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/qr" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          QR kodlara dön
        </ButtonLink>
        <ButtonLink href={`/qr/${event.slug}?print=1`} variant="primary" size="sm">
          <Printer className="h-4 w-4" />
          Baskı al
        </ButtonLink>
      </div>
      <QRPrintCard event={event} url={getEventUrl(event)} autoPrint={search.print === "1"} />
    </main>
  );
}
