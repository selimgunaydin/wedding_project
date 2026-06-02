import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/db";
import { createPresignedUploadUrl } from "@/lib/s3";
import { uploadPresignSchema, validateFileByRules } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = uploadPresignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Geçersiz dosya bilgisi." }, { status: 400 });
  }

  const validationError = validateFileByRules(parsed.data.mimeType, parsed.data.fileSize);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
  }

  try {
    const result = await createPresignedUploadUrl(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signed upload URL üretilemedi." },
      { status: 500 }
    );
  }
}
