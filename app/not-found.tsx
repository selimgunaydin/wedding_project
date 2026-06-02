import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium uppercase text-rose">Bulunamadı</p>
        <h1 className="mt-3 font-serif text-4xl">Bu sayfa sessizce kaybolmuş.</h1>
        <p className="mt-3 text-muted-foreground">Aradığınız bağlantı değişmiş olabilir. Ana sayfadan devam edebilirsiniz.</p>
        <ButtonLink href="/" className="mt-6">
          Ana sayfaya dön
        </ButtonLink>
      </div>
    </main>
  );
}
