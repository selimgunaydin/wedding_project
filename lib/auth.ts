import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "ani_kutusu_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSession = {
  email: string;
  exp: number;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "development-only-change-me";
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials(email: string, password: string) {
  return isAdminConfigured() && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}

export function createAdminSessionValue(email: string) {
  const payload: AdminSession = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSession(value?: string) {
  if (!value) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = crypto.createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminSession;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return admin;
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getAdminCookieMaxAge() {
  return SESSION_TTL_SECONDS;
}
