import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { formatLongDate } from "@/lib/format";
import type { EventRecord } from "@/types/database";

const FALLBACK_SITE_URL = "https://es.selwise.com";

export const DEFAULT_DESCRIPTION =
  "Ecem Sıla ve Selim'in nişan ve düğün günlerinden kalan fotoğraf ve videoları QR kod ile kolayca paylaşın.";

export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = "image/png";

function normalizeSiteUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

  return normalizeSiteUrl(configuredUrl ?? vercelUrl ?? FALLBACK_SITE_URL);
}

export const SITE_URL = getSiteUrl();
export const OG_IMAGE_URL = new URL(OG_IMAGE_PATH, SITE_URL).toString();

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function buildOgImage(alt = APP_NAME) {
  return {
    url: OG_IMAGE_URL,
    secureUrl: OG_IMAGE_URL,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
    type: OG_IMAGE_TYPE
  };
}

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  imageAlt?: string;
  noIndex?: boolean;
};

const publicRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1
  }
} satisfies Metadata["robots"];

const privateRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false
  }
} satisfies Metadata["robots"];

export function buildPageMetadata({
  title = APP_NAME,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  imageAlt = APP_NAME,
  noIndex = false
}: PageMetadataInput = {}): Metadata {
  const url = absoluteUrl(path);
  const image = buildOgImage(imageAlt);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "tr-TR": url
      }
    },
    robots: noIndex ? privateRobots : publicRobots,
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: APP_NAME,
      locale: "tr_TR",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export function buildEventMetadata(event: EventRecord): Metadata {
  const date = formatLongDate(event.event_date);
  const title = `${event.title} Fotoğraf ve Video Yükleme`;
  const description =
    event.description || `${date} tarihindeki özel günümüzden fotoğraf ve videolarınızı bizimle paylaşın.`;

  return buildPageMetadata({
    title,
    description,
    path: `/events/${event.slug}`,
    imageAlt: `${APP_NAME} - ${event.title} anı paylaşımı`
  });
}
