import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";
import { createUploadRecord, getEventBySlug } from "@/lib/db";
import { deleteObject, uploadObject } from "@/lib/s3";
import { eventSlugSchema, optionalGuestNameSchema, optionalGuestNoteSchema, validateFileByRules } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

function getRequiredHeader(request: Request, key: string) {
  const value = request.headers.get(key);
  return value && value.trim() ? value : null;
}

function decodeHeaderValue(value: string | null) {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const eventSlug = eventSlugSchema.safeParse(url.searchParams.get("eventSlug"));

  if (!eventSlug.success) {
    return NextResponse.json({ error: "Geçersiz etkinlik bağlantısı." }, { status: 400 });
  }

  const fileName = decodeHeaderValue(getRequiredHeader(request, "x-upload-file-name"));
  if (!fileName) {
    return NextResponse.json({ error: "Dosya adı eksik." }, { status: 400 });
  }

  const mimeType = getRequiredHeader(request, "content-type");
  if (!mimeType) {
    return NextResponse.json({ error: "Dosya türü eksik." }, { status: 400 });
  }

  const fileSize = Number(getRequiredHeader(request, "x-upload-file-size"));
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    return NextResponse.json({ error: "Dosya boyutu geçersiz." }, { status: 400 });
  }

  const uploadedByName = optionalGuestNameSchema.safeParse(decodeHeaderValue(request.headers.get("x-uploaded-by-name")));
  if (!uploadedByName.success) {
    return NextResponse.json({ error: uploadedByName.error.issues[0]?.message || "Ad alanı geçersiz." }, { status: 400 });
  }

  const uploadedByNote = optionalGuestNoteSchema.safeParse(decodeHeaderValue(request.headers.get("x-uploaded-by-note")));
  if (!uploadedByNote.success) {
    return NextResponse.json({ error: uploadedByNote.error.issues[0]?.message || "Not alanı geçersiz." }, { status: 400 });
  }

  const validationError = validateFileByRules(mimeType, fileSize);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const event = await getEventBySlug(eventSlug.data);
  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
  }

  if (!request.body) {
    return NextResponse.json({ error: "Dosya içeriği okunamadı." }, { status: 400 });
  }

  let uploadedFile: Awaited<ReturnType<typeof uploadObject>> | null = null;

  try {
    uploadedFile = await uploadObject({
      eventSlug: event.slug,
      fileName,
      mimeType,
      body: Readable.fromWeb(request.body as unknown as NodeReadableStream<Uint8Array>)
    });

    if (uploadedFile.uploadedBytes !== fileSize) {
      throw new Error("Dosya sunucuya eksik ulaştı. Proxy upload limitlerini kontrol edin.");
    }

    const upload = await createUploadRecord({
      event,
      fileName: uploadedFile.fileName,
      originalFileName: fileName,
      filePath: uploadedFile.filePath,
      fileUrl: uploadedFile.fileUrl,
      fileType: uploadedFile.fileType,
      mimeType,
      fileSize,
      uploadedByName: uploadedByName.data,
      uploadedByNote: uploadedByNote.data
    });

    return NextResponse.json({ upload });
  } catch (error) {
    if (uploadedFile) {
      await deleteObject(uploadedFile.filePath).catch((deleteError) => {
        console.error("upload cleanup failed", deleteError);
      });
    }

    console.error("server upload failed", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dosya yüklenemedi." },
      { status: 500 }
    );
  }
}
