import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { deleteUploadRecord, getUploadById } from "@/lib/db";
import { deleteObject } from "@/lib/s3";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: Context) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const { id } = await context.params;
  const upload = await getUploadById(id);

  if (!upload) {
    return NextResponse.json({ error: "Medya bulunamadı." }, { status: 404 });
  }

  if (upload.status === "rejected") {
    return NextResponse.json({ error: "Reddedilen medya silinmez; arşivde kalmalıdır." }, { status: 400 });
  }

  try {
    await deleteObject(upload.file_path);
    await deleteUploadRecord(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Medya silinemedi." },
      { status: 500 }
    );
  }
}
