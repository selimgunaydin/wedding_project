import Image from "next/image";
import { Camera } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="container-shell grid max-w-5xl items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <section>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/65 px-3 py-1.5 text-sm text-muted-foreground">
            <Camera className="h-4 w-4 text-rose" />
            {APP_NAME}
          </div>
          <h1 className="font-serif text-5xl leading-tight md:text-6xl">Anılarımızı birlikte büyütelim</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Fotoğraf veya video yüklemek için davetiyedeki etkinlik QR kodunu kullanabilirsiniz. QR kod sizi doğrudan doğru
            yükleme sayfasına götürür.
          </p>
        </section>

        <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-white/70 bg-white/50 shadow-soft">
          <Image
            src="/images/hero-memory-share.png"
            alt="Anı paylaşımı için zarif masa kompozisyonu"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </main>
  );
}
