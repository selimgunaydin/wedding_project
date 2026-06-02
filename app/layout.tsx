import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@/lib/constants";
import { buildPageMetadata, DEFAULT_DESCRIPTION, SITE_URL } from "@/lib/metadata";
import "./globals.css";

const rootMetadata = buildPageMetadata({
  title: APP_NAME,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  imageAlt: `${APP_NAME} anı paylaşımı`
});

export const metadata: Metadata = {
  ...rootMetadata,
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME, url: SITE_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "wedding",
  keywords: [
    "Ecem Sıla",
    "Selim",
    "düğün",
    "nişan",
    "anı paylaşımı",
    "fotoğraf yükleme",
    "video yükleme",
    "QR kod"
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico"
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default"
  },
  formatDetection: {
    telephone: false
  },
  other: {
    "og:image:secure_url": `${SITE_URL}/og-image.png`,
    "og:image:type": "image/png",
    "og:image:width": "1200",
    "og:image:height": "630"
  },
};

export const viewport: Viewport = {
  themeColor: "#f7eee8",
  colorScheme: "light"
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
