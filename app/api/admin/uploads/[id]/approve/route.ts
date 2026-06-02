import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { updateUploadStatus } from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const upload = await updateUploadStatus(id, "approved");
    return NextResponse.json({ upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Medya onaylanamadı." },
      { status: 500 }
    );
  }
}
