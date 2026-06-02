import { CheckCircle2, Images, QrCode, ShieldCheck, Smartphone, UploadCloud, Video } from "lucide-react";
import { EventCard } from "@/components/public/EventCard";
import { FAQAccordion } from "@/components/public/FAQAccordion";
import { FeatureCard } from "@/components/public/FeatureCard";
import { Footer } from "@/components/public/Footer";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { HeroSection } from "@/components/public/HeroSection";
import { Navbar } from "@/components/public/Navbar";
import { SectionHeader } from "@/components/public/SectionHeader";
import { StepCard } from "@/components/public/StepCard";
import { getEvents, getRecentApprovedUploads } from "@/lib/db";

export default async function HomePage() {
  const events = await getEvents();
  const recentUploads = await getRecentApprovedUploads(6);

  const steps = [
    {
      icon: QrCode,
      title: "QR kodu okut",
      description: "Etkinliğe özel bağlantı doğrudan telefonunuzda açılır."
    },
    {
      icon: Images,
      title: "Anını seç",
      description: "Fotoğraf veya videonuzu galerinizden kolayca ekleyin."
    },
    {
      icon: UploadCloud,
      title: "Bizimle paylaş",
      description: "Yüklediğiniz anılar onaylandıktan sonra galeride görünür."
    }
  ];

  const features = [
    { icon: Smartphone, title: "Uygulama gerekmez", description: "Tarayıcı üzerinden saniyeler içinde çalışır." },
    { icon: UploadCloud, title: "Hızlı yükleme", description: "Dosyalar imzalı URL ile doğrudan storage alanına gider." },
    { icon: QrCode, title: "Etkinliğe özel alan", description: "Her tarih kendi QR kodu ve galerisini kullanır." },
    { icon: Images, title: "Tüm anılar tek yerde", description: "Fotoğraf ve videolar düzenli biçimde toplanır." },
    { icon: ShieldCheck, title: "Kontrollü galeri", description: "Public alanda yalnızca onaylı medyalar gösterilir." },
    { icon: Video, title: "Video desteği", description: "MP4, MOV ve WebM formatları desteklenir." }
  ];

  return (
    <>
      <Navbar />
      <main>
        <HeroSection events={events} />

        <section className="container-shell py-14 md:py-20">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Etkinlikler"
              title="Üç özel gün, üç ayrı anı alanı"
              description="Her etkinliğin kendi QR kodu, yükleme alanı ve onaylı galerisi var."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-white/35 py-14 md:py-20">
          <div className="container-shell">
            <SectionHeader title="Nasıl çalışır?" description="QR koddan yüklemeye kadar akış kısa ve anlaşılır." />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <StepCard key={step.title} index={index + 1} {...step} />
              ))}
            </div>
          </div>
        </section>

        <section className="container-shell py-14 md:py-20">
          <SectionHeader title="Neden bu sistem?" description="Misafir deneyimi sade, admin kontrolü güçlü kalsın diye tasarlandı." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-white/35 py-14 md:py-20">
          <div className="container-shell">
            <div className="mb-8 flex items-end justify-between gap-4">
              <SectionHeader title="Galeri önizleme" description="Onaylanan son anılar burada zarif bir akışta görünür." />
              <CheckCircle2 className="hidden h-8 w-8 text-sage md:block" />
            </div>
            <GalleryGrid uploads={recentUploads} />
          </div>
        </section>

        <section className="container-shell py-14 md:py-20">
          <SectionHeader title="SSS" description="Misafirlerin aklına gelebilecek kısa cevaplar." />
          <div className="mt-8 max-w-3xl">
            <FAQAccordion />
          </div>
        </section>
      </main>
      <Footer events={events} />
    </>
  );
}
