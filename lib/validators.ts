import { z } from "zod";
import { ACCEPTED_MIME_TYPES, IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from "@/lib/constants";

export const eventSlugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "Geçersiz etkinlik bağlantısı.");

export const optionalGuestNameSchema = z
  .string()
  .trim()
  .max(80, "Ad alanı en fazla 80 karakter olabilir.")
  .optional()
  .transform((value) => value || undefined);

export const optionalGuestNoteSchema = z
  .string()
  .trim()
  .max(500, "Not alanı en fazla 500 karakter olabilir.")
  .optional()
  .transform((value) => value || undefined);

export const uploadPresignSchema = z.object({
  eventSlug: eventSlugSchema,
  fileName: z.string().min(1).max(240),
  mimeType: z.string().refine((mime) => ACCEPTED_MIME_TYPES.includes(mime as never), {
    message: "Bu dosya türü desteklenmiyor."
  }),
  fileSize: z.number().int().positive()
});

export const uploadCompleteSchema = z.object({
  eventSlug: eventSlugSchema,
  fileName: z.string().min(1).max(240),
  originalFileName: z.string().min(1).max(240),
  filePath: z.string().min(10).max(700),
  fileUrl: z.string().url(),
  fileType: z.enum(["image", "video"]),
  mimeType: z.string(),
  fileSize: z.number().int().positive(),
  uploadedByName: optionalGuestNameSchema,
  uploadedByNote: optionalGuestNoteSchema
});

export const adminLoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(1, "Şifre gerekli.")
});

export const adminUploadFilterSchema = z.object({
  eventSlug: eventSlugSchema.optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  fileType: z.enum(["image", "video"]).optional()
});

export function validateFileByRules(mimeType: string, _fileSize: number) {
  if (IMAGE_MIME_TYPES.includes(mimeType as never) || VIDEO_MIME_TYPES.includes(mimeType as never)) {
    return null;
  }

  return "Bu dosya türü desteklenmiyor.";
}
