import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSession } from "@/lib/auth";
import { getUploadById } from "@/lib/db";
import { getObject } from "@/lib/s3";
import { createZipStream } from "@/lib/zip";

const querySchema = z.object({
  ids: z
    .string()
    .transform((value) => value.split(",").map((id) => id.trim()).filter(Boolean))
    .pipe(z.array(z.string().uuid()).min(1))
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

function sanitizeZipFileName(fileName: string, index: number) {
  const safeName = fileName.replace(/[\\/:*?"<>|\r\n]+/g, "_").replace(/^\.+$/, "dosya").trim();
  return `${String(index + 1).padStart(2, "0")}-${safeName || "dosya"}`;
}

function toAsyncIterable(body: unknown) {
  if (body && typeof (body as { transformToWebStream?: unknown }).transformToWebStream === "function") {
    const stream = (body as { transformToWebStream: () => ReadableStream<Uint8Array> }).transformToWebStream();
    return Readable.fromWeb(stream as unknown as NodeReadableStream<Uint8Array>);
  }

  return body as Readable;
}

function encodeContentDispositionFileName(fileName: string) {
  return `filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

async function buildZipResponse(ids: string[]) {
  const uploads = (await Promise.all(ids.map((id) => getUploadById(id)))).filter(Boolean);

  if (uploads.length === 0) {
    return NextResponse.json({ error: "Medya bulunamadı." }, { status: 404 });
  }

  const zipEntries = uploads.map((upload, index) => ({
    fileName: sanitizeZipFileName(upload!.original_file_name, index),
    body: (async function* () {
      const object = await getObject({ filePath: upload!.file_path });
      if (!object.Body) {
        throw new Error(`${upload!.original_file_name} okunamadı.`);
      }

      for await (const chunk of toAsyncIterable(object.Body)) {
        yield Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      }
    })(),
  }));

  const fileName = `ani-kutusu-${new Date().toISOString().slice(0, 10)}.zip`;
  const headers = new Headers();
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Disposition", `attachment; ${encodeContentDispositionFileName(fileName)}`);
  headers.set("Cache-Control", "no-store");

  return new Response(Readable.toWeb(Readable.from(createZipStream(zipEntries))) as ReadableStream, {
    headers,
  });
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    ids: request.nextUrl.searchParams.get("ids")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "İndirilecek medya seçilmedi." }, { status: 400 });
  }

  return buildZipResponse(parsed.data.ids);
}

// "Tümünü indir" yüzlerce dosyada URL uzunluğu sınırına takılmasın diye POST
// ile id listesi form alanında (ids=virgülle ayrılmış) gönderilir.
export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(getAdminCookieName())?.value)) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = querySchema.safeParse({ ids: formData.get("ids") });

  if (!parsed.success) {
    return NextResponse.json({ error: "İndirilecek medya seçilmedi." }, { status: 400 });
  }

  return buildZipResponse(parsed.data.ids);
}
