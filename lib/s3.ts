import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PRESIGNED_URL_EXPIRES_IN_SECONDS } from "@/lib/constants";
import { buildStoragePath, getFileTypeFromMime } from "@/lib/upload";

type PresignInput = {
  eventSlug: string;
  fileName: string;
  mimeType: string;
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

export async function createPresignedUploadUrl(input: PresignInput) {
  const fileType = getFileTypeFromMime(input.mimeType);
  if (!fileType) throw new Error("Desteklenmeyen dosya türü.");

  const filePath = buildStoragePath(
    input.eventSlug,
    input.fileName,
    input.mimeType,
  );
  const command = new PutObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
    ContentType: input.mimeType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
  });

  return {
    uploadUrl,
    filePath,
    fileUrl: getPublicFileUrl(filePath),
    fileName: filePath.split("/").at(-1)!,
    fileType,
    expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
  };
}

export async function deleteObject(filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CONTABO_S3_BUCKET_NAME,
    Key: filePath,
  });

  await getS3Client().send(command);
}
