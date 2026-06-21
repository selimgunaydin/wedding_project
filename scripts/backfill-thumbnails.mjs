// Var olan görseller için thumbnail üretir.
//
// Yeni yüklemeler thumbnail'ı otomatik alır; bu script daha önce yüklenmiş
// (thumbnail_path = NULL) görseller için geriye dönük üretir.
//
// Çalıştırma (proje kökünde, .env dolu olmalı):
//   node scripts/backfill-thumbnails.mjs
//
// Önce supabase/add-thumbnails.sql migrasyonunu çalıştırmış olmalısınız.

import { readFileSync } from "node:fs";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const THUMBNAIL_MAX_EDGE = 480;
const CONCURRENCY = 4;

// .env dosyasını basitçe oku (Node sürümünden bağımsız olsun diye).
function loadEnv() {
  let raw = "";
  for (const file of [".env", ".env.local"]) {
    try {
      raw += "\n" + readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    } catch {
      // dosya yoksa geç
    }
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CONTABO_S3_ENDPOINT,
  CONTABO_S3_REGION,
  CONTABO_S3_ACCESS_KEY_ID,
  CONTABO_S3_SECRET_ACCESS_KEY,
  CONTABO_S3_BUCKET_NAME,
  CONTABO_S3_PUBLIC_BASE_URL,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik.");
  process.exit(1);
}
if (!CONTABO_S3_BUCKET_NAME || !CONTABO_S3_PUBLIC_BASE_URL) {
  console.error("Contabo S3 env değişkenleri eksik.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const s3 = new S3Client({
  endpoint: CONTABO_S3_ENDPOINT,
  region: CONTABO_S3_REGION || "default",
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: CONTABO_S3_ACCESS_KEY_ID,
    secretAccessKey: CONTABO_S3_SECRET_ACCESS_KEY,
  },
});

function publicUrl(path) {
  return `${CONTABO_S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${path}`;
}

function thumbnailPathFor(filePath) {
  return `${filePath.replace("/images/", "/thumbs/")}.webp`;
}

async function streamToBuffer(body) {
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function processUpload(upload) {
  const object = await s3.send(new GetObjectCommand({ Bucket: CONTABO_S3_BUCKET_NAME, Key: upload.file_path }));
  const original = await streamToBuffer(object.Body);

  const thumbnail = await sharp(original, { failOn: "none" })
    .rotate()
    .resize(THUMBNAIL_MAX_EDGE, THUMBNAIL_MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();

  const thumbnailPath = thumbnailPathFor(upload.file_path);
  await s3.send(new PutObjectCommand({
    Bucket: CONTABO_S3_BUCKET_NAME,
    Key: thumbnailPath,
    Body: thumbnail,
    ContentType: "image/webp",
    ContentLength: thumbnail.length,
  }));

  const { error } = await supabase
    .from("uploads")
    .update({ thumbnail_path: thumbnailPath, thumbnail_url: publicUrl(thumbnailPath) })
    .eq("id", upload.id);

  if (error) throw error;
}

async function main() {
  const { data, error } = await supabase
    .from("uploads")
    .select("id, file_path")
    .eq("file_type", "image")
    .is("thumbnail_path", null);

  if (error) {
    console.error("Kayıtlar alınamadı:", error.message);
    process.exit(1);
  }

  const uploads = data ?? [];
  console.log(`İşlenecek görsel: ${uploads.length}`);

  let done = 0;
  let failed = 0;

  for (let i = 0; i < uploads.length; i += CONCURRENCY) {
    const batch = uploads.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (upload) => {
        try {
          await processUpload(upload);
          done += 1;
          console.log(`✓ ${done}/${uploads.length} ${upload.file_path}`);
        } catch (err) {
          failed += 1;
          console.error(`✗ ${upload.file_path}:`, err?.message || err);
        }
      })
    );
  }

  console.log(`\nBitti. Başarılı: ${done}, başarısız: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
