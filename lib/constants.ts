export const APP_NAME = "Ecem Sıla & Selim Günaydın";

export const MAX_IMAGE_SIZE_MB = 15;
export const MAX_VIDEO_SIZE_MB = 300;
export const MAX_FILES_PER_UPLOAD = 10;
export const PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 5;

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;
export const ACCEPTED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES] as const;

export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export const EVENT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
};
