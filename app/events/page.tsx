import { EventCard } from "@/components/public/EventCard";
import { EventTimeline } from "@/components/public/EventTimeline";
import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { PageHeader } from "@/components/public/PageHeader";
import { getEvents } from "@/lib/db";

export const metadata = {
  title: "Etkinlikler"
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          eyebrow="Etkinlikler"
          title="Anınızı paylaşmak istediğiniz günü seçin"
          description="Her sayfa kendi tarihine ve QR koduna bağlıdır. Doğru etkinliği seçmeniz yeterli."
        />
        <section className="container-shell pb-14">
          <EventTimeline events={events} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </main>
      <Footer events={events} />
    </>
  );
}
