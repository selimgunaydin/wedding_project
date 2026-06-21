import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";
import sharp from "sharp";
import { buildStoragePath, buildThumbnailPath, getFileTypeFromMime } from "@/lib/upload";

// Izgarada gösterilecek küçük önizlemenin uzun kenarı (px).
const THUMBNAIL_MAX_EDGE = 480;

const MULTIPART_CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(label: string, action: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) break;
      const backoff = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(`${label} başarısız (deneme ${attempt}/${MAX_RETRIES}), tekrar deneniyor`, error);
      await delay(backoff);
    }
  }

  throw lastError;
}

type UploadObjectInput = {
  eventSlug: string;
  fileName: string;
  mimeType: string;
  body: Readable;
};

type GetObjectInput = {
  filePath: string;
  range?: string | null;
};

export function isS3Configured() {
  return Boolean(
    process.env.CONTABO_S3_ENDPOINT &&
    process.env.CONTABO_S3_REGION &&
    process.env.CONTABO_S3_ACCESS_KEY_ID &&
    process.env.CONTABO_S3_SECRET_ACCESS_KEY &&
    process.env.CONTABO_S3_BUCKET_NAME &&
    process.env.CONTABO_S3_PUBLIC_BASE_URL,
  );
}

function getS3Client() {
  if (!isS3Configured()) {
    throw new Error("Contabo Object Storage env değişkenleri eksik.");
  }

  return new S3Client({
    endpoint: process.env.CONTABO_S3_ENDPOINT,
    region: process.env.CONTABO_S3_REGION || "default",
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: process.env.CONTABO_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CONTABO_S3_SECRET_ACCESS_KEY!,
    },
  });
}

export function getPublicFileUrl(filePath: string) {
  if (!process.env.CONTABO_S3_PUBLIC_BASE_URL) {
    throw new Error("CONTABO_S3_PUBLIC_BASE_URL eksik.");
  }

  return `${process.env.CONTABO_S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${filePath}`;
}

export async function uploadObject(input: UploadObjectInput) {
  const fileType = getFileTypeFromMime(input.mimeType);
  if (!fileType) throw new Error("Desteklenmeyen dosya türü.");

  const filePath = buildStoragePath(
    input.eventSlug,
    input.fileName,
    input.mimeType,
  );
  const client = getS3Client();
  const createResult = await withRetry("multipart başlatma", () =>
    client.send(new CreateMultipartUploadCommand({
      Bucket: process.env.CONTABO_S3_BUCKET_NAME,
      Key: filePath,
      ContentType: input.mimeType,
    })),
  );

  if (!createResult.UploadId) {
    throw new Error("Contabo multipart upload başlatılamadı.");
  }

  const parts: CompletedPart[] = [];
  let partNumber = 1;
  // Parçaları diziye biriktiriyoruz; her chunk'ta Buffer.concat çağırmak
  // büyük dosyalarda O(n²) bellek kopyasına yol açtığı için yalnızca eşik
  // dolunca tek seferde birleştiriyoruz.
  let pendingChunks: Buffer[] = [];
  let pendingLength = 0;
  let uploadedBytes = 0;

  try {
    async function uploadPart(body: Buffer) {
      const currentPart = partNumber;
      const result = await withRetry(`parça ${currentPart} yükleme`, () =>
        client.send(new UploadPartCommand({
          Bucket: process.env.CONTABO_S3_BUCKET_NAME,
          Key: filePath,
          UploadId: createResult.UploadId,
          PartNumber: currentPart,
          Body: body,
          ContentLength: body.length,
        })),
      );

      if (!result.ETag) {
        throw new Error("Contabo upload parçası ETag döndürmedi.");
      }

      parts.push({ ETag: result.ETag, PartNumber: currentPart });
      partNumber += 1;
    }

    for await (const chunk of input.body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      uploadedBytes += buffer.length;
      pendingChunks.push(buffer);
      pendingLength += buffer.length;

      if (pendingLength >= MULTIPART_CHUNK_SIZE) {
        const merged = Buffer.concat(pendingChunks, pendingLength);
        let offset = 0;
        while (merged.length - offset >= MULTIPART_CHUNK_SIZE) {
          await uploadPart(merged.subarray(offset, offset + MULTIPART_CHUNK_SIZE));
          offset += MULTIPART_CHUNK_SIZE;
        }
        const remainder = merged.subarray(offset);
        pendingChunks = remainder.length > 0 ? [remainder] : [];
        pendingLength = remainder.length;
      }
    }

    if (pendingLength > 0 || parts.length === 0) {
      await uploadPart(Buffer.concat(pendingChunks, pendingLength));
    }

    await withRetry("multipart tamamlama", () =>
      client.send(new CompleteMultipartUploadCommand({
        Bucket: process.env.CONTABO_S3_BUCKET_NAME,
        Key: filePath,
        UploadId: createResult.UploadId,
        MultipartUpload: { Parts: parts },
      })),
    );
  } catch (error) {
    await client.send(new AbortMultipartUploadCommand({
      Bucket: process.env.CONTABO_S3_BUCKET_NAME,
      Key: filePath,
      UploadId: createResult.UploadId,
    })).catch((abortError) => {
      console.error("multipart upload cleanup failed", abortError);
    });

    throw error;
  }

  return {
    filePath,
    fileUrl: getPublicFileUrl(filePath),
    fileName: filePath.split("/").at(-1)!,
    fileType,
    uploadedBytes,
  };
}

async function putBuffer(filePath: string, body: Buffer, contentType: string) {
  const client = getS3Client();
  await client.send(new PutObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
    Body: body,
    ContentType: contentType,
    ContentLength: body.length,
  }));
}

export async function generateThumbnail(source: Buffer) {
  return sharp(source, { failOn: "none" })
    .rotate() // EXIF yönünü uygula
    .resize(THUMBNAIL_MAX_EDGE, THUMBNAIL_MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
}

// Görseli tek PutObject ile yükler ve yanında küçük bir webp thumbnail üretir.
// Thumbnail üretimi başarısız olursa (bozuk görsel vb.) orijinal yine de yüklenir,
// thumbnail alanları null döner ve panel orijinale geri düşer.
export async function uploadImageBuffer(input: {
  eventSlug: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const fileType = getFileTypeFromMime(input.mimeType);
  if (fileType !== "image") throw new Error("Bu fonksiyon yalnızca görseller içindir.");

  const filePath = buildStoragePath(input.eventSlug, input.fileName, input.mimeType);
  await putBuffer(filePath, input.buffer, input.mimeType);

  let thumbnailPath: string | null = null;
  let thumbnailUrl: string | null = null;
  try {
    const thumbnail = await generateThumbnail(input.buffer);
    thumbnailPath = buildThumbnailPath(filePath);
    await putBuffer(thumbnailPath, thumbnail, "image/webp");
    thumbnailUrl = getPublicFileUrl(thumbnailPath);
  } catch (error) {
    console.error("thumbnail oluşturulamadı", error);
    thumbnailPath = null;
    thumbnailUrl = null;
  }

  return {
    filePath,
    fileUrl: getPublicFileUrl(filePath),
    fileName: filePath.split("/").at(-1)!,
    fileType,
    uploadedBytes: input.buffer.length,
    thumbnailPath,
    thumbnailUrl,
  };
}

export async function deleteObject(filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
  });

  await getS3Client().send(command);
}

export async function getObject(input: GetObjectInput) {
  const command = new GetObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: input.filePath,
    Range: input.range || undefined,
  });

  return getS3Client().send(command);
}
