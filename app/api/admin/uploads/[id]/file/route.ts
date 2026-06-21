import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getUploadById } from "@/lib/db";
import { getObject } from "@/lib/s3";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function encodeContentDispositionFileName(fileName: string) {
  const fallback = fileName.replace(/["\\\r\n]/g, "_");
  return `filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

function toWebStream(body: unknown) {
  if (body && typeof (body as { transformToWebStream?: unknown }).transformToWebStream === "function") {
    return (body as { transformToWebStream: () => ReadableStream }).transformToWebStream();
  }

  return Readable.toWeb(body as Readable) as ReadableStream;
}

export async function GET(request: NextRequest, context: Context) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const { id } = await context.params;
  const upload = await getUploadById(id);

  if (!upload) {
    return NextResponse.json({ error: "Medya bulunamadı." }, { status: 404 });
  }

  // ?thumb=1 -> küçük önizlemeyi sun (varsa). Yoksa orijinale düşeriz.
  const wantsThumb = request.nextUrl.searchParams.get("thumb") === "1";
  const servedPath = wantsThumb && upload.thumbnail_path ? upload.thumbnail_path : upload.file_path;

  try {
    const object = await getObject({
      filePath: servedPath,
      range: request.headers.get("range"),
    });

    if (!object.Body) {
      return NextResponse.json({ error: "Medya içeriği okunamadı." }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.ContentType || upload.mime_type || "application/octet-stream");
    headers.set("Accept-Ranges", object.AcceptRanges || "bytes");
    headers.set("Cache-Control", "private, max-age=60");

    if (object.ContentLength !== undefined) {
      headers.set("Content-Length", String(object.ContentLength));
    }

    if (object.ContentRange) {
      headers.set("Content-Range", object.ContentRange);
    }

    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
    headers.set("Content-Disposition", `${disposition}; ${encodeContentDispositionFileName(upload.original_file_name)}`);

    return new Response(toWebStream(object.Body), {
      status: object.ContentRange ? 206 : 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Medya okunamadı." },
      { status: 500 }
    );
  }
}
