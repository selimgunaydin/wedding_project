import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { PageHeader } from "@/components/public/PageHeader";
import { QRCodeCard } from "@/components/qr/QRCodeCard";
import { getEvents } from "@/lib/db";
import { getEventUrl } from "@/lib/qr";

export const metadata = {
  title: "QR Kodlar"
};

export default async function QRPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="QR Kodlar"
          title="Her etkinlik için hazır QR kartları"
          description="Misafirler QR kodu okuttuğunda doğrudan ilgili upload sayfasına gider."
        />
        <section className="container-shell grid gap-4 pb-14 md:grid-cols-3">
          {events.map((event) => (
            <QRCodeCard key={event.id} event={event} url={getEventUrl(event)} />
          ))}
        </section>
      </main>
      <Footer events={events} />
    </>
  );
}
