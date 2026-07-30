import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  isAdminConfigured,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url), 303);
  }

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(
    new URL("/admin/dashboard", request.url),
    303,
  );
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createAdminSession(email),
    adminCookieOptions,
  );
  return response;
}
