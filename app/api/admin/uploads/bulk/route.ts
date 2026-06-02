import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { bulkDeleteUploadRecords, bulkUpdateUploads, getUploadById } from "@/lib/db";
import { deleteObject } from "@/lib/s3";

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(["approve", "reject", "delete"])
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Toplu işlem bilgisi geçersiz." }, { status: 400 });
  }

  try {
    if (parsed.data.action === "delete") {
      const uploads = (await Promise.all(parsed.data.ids.map((id) => getUploadById(id)))).filter(Boolean);
      await Promise.all(uploads.map((upload) => deleteObject(upload!.file_path)));
      await bulkDeleteUploadRecords(parsed.data.ids);
      return NextResponse.json({ ok: true });
    }

    const uploads = await bulkUpdateUploads(parsed.data.ids, parsed.data.action === "approve" ? "approved" : "rejected");
    return NextResponse.json({ uploads });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Toplu işlem tamamlanamadı." },
      { status: 500 }
    );
  }
}
