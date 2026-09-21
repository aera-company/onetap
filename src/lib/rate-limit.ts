import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { consumeRateLimit } from "@/lib/supabase";

function getSalt() {
  return process.env.IP_HASH_SALT ?? process.env.ADMIN_SESSION_SECRET;
}

/**
 * IP do cliente. Na Vercel estes cabeçalhos são definidos pela plataforma e
 * sobrescrevem o que o cliente enviar; atrás de outro proxy, confira se o mesmo
 * vale antes de confiar neles.
 */
export function getClientIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "";
}

/**
 * Consome uma unidade do limite para este IP e escopo.
 *
 * O IP nunca é gravado: a chave é um HMAC dele com o escopo. Sem salt ou sem
 * IP identificável a checagem é liberada — derrubar tráfego legítimo por
 * configuração incompleta é pior do que ficar sem o limite.
 */
export async function allowRequest(
  request: NextRequest,
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const salt = getSalt();
  const ip = getClientIp(request);

  if (!salt || !ip) {
    console.warn(
      `[rate-limit] Ignorado em "${scope}": ${
        salt ? "IP do cliente indisponível" : "defina IP_HASH_SALT ou ADMIN_SESSION_SECRET"
      }.`,
    );
    return true;
  }

  const key = createHmac("sha256", salt)
    .update(`${scope}:${ip}`)
    .digest("base64url");

  return consumeRateLimit(key, limit, windowSeconds);
}

/**
 * Recusa POSTs vindos de outra origem. Quando o cabeçalho `Origin` não vem
 * (clientes antigos, alguns beacons), a requisição passa — a alternativa seria
 * perder eventos legítimos.
 */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host") ?? request.nextUrl.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
