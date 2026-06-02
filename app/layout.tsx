import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://es.selwise.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: "Ecem Sıla & Selim Günaydın",
  description:
    "Ecem Sıla ve Selim Günaydın’ın en özel günlerinden kalan fotoğraf ve videoları QR kod ile kolayca paylaşın.",

  openGraph: {
    title: "Ecem Sıla & Selim Günaydın",
    description:
      "Fotoğraf ve videoları QR kod ile paylaşın, tüm anıları tek yerde biriktirelim.",
    url: appUrl,
    siteName: "Ecem Sıla & Selim Günaydın",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ecem Sıla & Selim Günaydın",
      },
    ],
    type: "website",
    locale: "tr_TR",
  },

  twitter: {
    card: "summary_large_image",
    title: "Ecem Sıla & Selim Günaydın",
    description:
      "Fotoğraf ve videoları QR kod ile paylaşın, tüm anıları tek yerde biriktirelim.",
    images: ["/og-image.png"],
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