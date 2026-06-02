import { ACCEPTED_MIME_TYPES, IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from "@/lib/constants";
import type { UploadFileType } from "@/types/database";

const turkishCharMap: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u"
};

export function sanitizeFileName(fileName: string) {
  const replaced = fileName
    .split("")
    .map((char) => turkishCharMap[char] ?? char)
    .join("");

  const parts = replaced.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  const base = parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return `${base || "ani"}${extension}`;
}

export function getFileTypeFromMime(mimeType: string): UploadFileType | null {
  if (IMAGE_MIME_TYPES.includes(mimeType as never)) return "image";
  if (VIDEO_MIME_TYPES.includes(mimeType as never)) return "video";
  return null;
}

export function isAcceptedMimeType(mimeType: string) {
  return ACCEPTED_MIME_TYPES.includes(mimeType as never);
}

export function buildStoragePath(eventSlug: string, fileName: string, mimeType: string) {
  const fileType = getFileTypeFromMime(mimeType);
  if (!fileType) throw new Error("Desteklenmeyen dosya türü.");

  const folder = fileType === "image" ? "images" : "videos";
  const safeName = sanitizeFileName(fileName);
  const randomId = crypto.randomUUID().slice(0, 8);

  return `events/${eventSlug}/${folder}/${Date.now()}-${randomId}-${safeName}`;
}

export function assertStoragePathBelongsToEvent(filePath: string, eventSlug: string) {
  return filePath.startsWith(`events/${eventSlug}/images/`) || filePath.startsWith(`events/${eventSlug}/videos/`);
}
