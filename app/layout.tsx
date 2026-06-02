import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Anı Kutusu",
    template: "%s · Anı Kutusu"
  },
  description: "Nişan ve düğün anılarını QR kod ile fotoğraf-video olarak toplama platformu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
