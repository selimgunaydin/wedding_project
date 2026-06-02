import { NextResponse } from "next/server";
import { createUploadRecord, getEventBySlug } from "@/lib/db";
import { assertStoragePathBelongsToEvent, getFileTypeFromMime } from "@/lib/upload";
import { uploadCompleteSchema, validateFileByRules } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = uploadCompleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Yükleme kaydı geçersiz." }, { status: 400 });
  }

  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });

  const validationError = validateFileByRules(parsed.data.mimeType, parsed.data.fileSize);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  if (getFileTypeFromMime(parsed.data.mimeType) !== parsed.data.fileType) {
    return NextResponse.json({ error: "Dosya türü mime bilgisiyle eşleşmiyor." }, { status: 400 });
  }

  if (!assertStoragePathBelongsToEvent(parsed.data.filePath, event.slug)) {
    return NextResponse.json({ error: "Dosya yolu etkinlikle eşleşmiyor." }, { status: 400 });
  }

  try {
    const upload = await createUploadRecord({
      event,
      fileName: parsed.data.fileName,
      originalFileName: parsed.data.originalFileName,
      filePath: parsed.data.filePath,
      fileUrl: parsed.data.fileUrl,
      fileType: parsed.data.fileType,
      mimeType: parsed.data.mimeType,
      fileSize: parsed.data.fileSize,
      uploadedByName: parsed.data.uploadedByName,
      uploadedByNote: parsed.data.uploadedByNote
    });

    return NextResponse.json({ upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Yükleme kaydı oluşturulamadı." },
      { status: 500 }
    );
  }
}
