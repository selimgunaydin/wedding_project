import { EVENT_DATE_FORMAT_OPTIONS } from "@/lib/constants";

export function formatDate(date: string | Date) {
  const normalized = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return new Intl.DateTimeFormat("tr-TR", EVENT_DATE_FORMAT_OPTIONS).format(normalized);
}

export function formatLongDate(date: string | Date) {
  const normalized = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(normalized);
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function pluralizeFile(count: number) {
  return `${count} dosya`;
}
