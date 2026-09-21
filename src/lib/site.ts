import { headers } from "next/headers";

/**
 * Base absoluta usada nas URLs gravadas em NFC e nos QR Codes.
 * `NEXT_PUBLIC_SITE_URL` manda; sem ela, cai no host da própria requisição —
 * assim nenhum domínio de tenant fica fixo no código.
 */
export async function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
