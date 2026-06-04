import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  S3Client,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";
import { buildStoragePath, getFileTypeFromMime } from "@/lib/upload";

const MULTIPART_CHUNK_SIZE = 8 * 1024 * 1024;

type UploadObjectInput = {
  eventSlug: string;
  fileName: string;
  mimeType: string;
  body: Readable;
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
  const createResult = await client.send(new CreateMultipartUploadCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
    ContentType: input.mimeType,
  }));

  if (!createResult.UploadId) {
    throw new Error("Contabo multipart upload başlatılamadı.");
  }

  const parts: CompletedPart[] = [];
  let partNumber = 1;
  let pending = Buffer.alloc(0);
  let uploadedBytes = 0;

  try {
    async function uploadPart(body: Buffer) {
      const result = await client.send(new UploadPartCommand({
        Bucket: process.env.CONTABO_S3_BUCKET_NAME,
        Key: filePath,
        UploadId: createResult.UploadId,
        PartNumber: partNumber,
        Body: body,
        ContentLength: body.length,
      }));

      if (!result.ETag) {
        throw new Error("Contabo upload parçası ETag döndürmedi.");
      }

      parts.push({ ETag: result.ETag, PartNumber: partNumber });
      partNumber += 1;
    }

    for await (const chunk of input.body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      uploadedBytes += buffer.length;
      pending = Buffer.concat([pending, buffer]);

      while (pending.length >= MULTIPART_CHUNK_SIZE) {
        const part = pending.subarray(0, MULTIPART_CHUNK_SIZE);
        pending = pending.subarray(MULTIPART_CHUNK_SIZE);
        await uploadPart(part);
      }
    }

    if (pending.length > 0 || parts.length === 0) {
      await uploadPart(pending);
    }

    await client.send(new CompleteMultipartUploadCommand({
      Bucket: process.env.CONTABO_S3_BUCKET_NAME,
      Key: filePath,
      UploadId: createResult.UploadId,
      MultipartUpload: { Parts: parts },
    }));
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

export async function deleteObject(filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
  });

  await getS3Client().send(command);
}
