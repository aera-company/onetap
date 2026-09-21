import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "onetap_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type AdminSession = {
  userId: string;
  email: string;
};

// Web Crypto em vez de node:crypto: o middleware roda no Edge, onde os módulos
// do Node não existem. Assim há uma implementação só para os dois runtimes.
function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Os administradores vivem no Supabase, então ele também precisa estar configurado. */
export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_SESSION_SECRET &&
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

export async function createAdminSession(session: AdminSession) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurado.");

  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        userId: session.userId,
        email: session.email,
        expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
      }),
    ),
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    new TextEncoder().encode(payload),
  );

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(
  token?: string,
): Promise<AdminSession | null> {
  const secret = getSessionSecret();
  if (!token || !secret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    // subtle.verify compara em tempo constante.
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const session = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as { userId?: string; email?: string; expiresAt?: number };

    if (!session.userId || !session.email) return null;
    if (!session.expiresAt || session.expiresAt <= Date.now()) return null;

    return { userId: session.userId, email: session.email };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
