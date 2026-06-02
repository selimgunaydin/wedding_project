import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecem Sıla & Selim Günaydın",
  description:
    "Ecem Sıla ve Selim Günaydın’ın en özel günlerinden kalan fotoğraf ve videoları QR kod ile kolayca paylaşın.",
  openGraph: {
    title: "Ecem Sıla & Selim Günaydın",
    description:
      "Fotoğraf ve videoları QR kod ile paylaşın, tüm anıları tek yerde biriktirelim.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ecem Sıla & Selim Günaydın",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
