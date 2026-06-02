import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminLoginSchema } from "@/lib/validators";
import {
  createAdminSessionValue,
  getAdminCookieMaxAge,
  getAdminCookieName,
  isAdminConfigured,
  verifyAdminCredentials
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "E-posta ve şifreyi kontrol edin." }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "ADMIN_EMAIL ve ADMIN_PASSWORD yapılandırılmamış." }, { status: 500 });
  }

  if (!verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), createAdminSessionValue(parsed.data.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminCookieMaxAge()
  });

  return NextResponse.json({ ok: true });
}
