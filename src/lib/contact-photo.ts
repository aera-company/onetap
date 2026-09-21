import type { VCardPhoto } from "@/lib/vcard";

/** Acima disso a foto pesa demais no .vcf; o contato sai sem foto. */
const MAX_PHOTO_BYTES = 200_000;

/**
 * Onde procurar a foto do contato, em ordem de preferência.
 *
 * O símbolo do perfil costuma ser um PNG branco sem fundo, que some na agenda
 * (fundo claro). Por isso, para um símbolo interno (`/brand/x.png`), um
 * `/brand/x-contact.jpg` ao lado — quadrado e opaco — tem prioridade.
 * URLs externas só entram se forem https.
 */
export function contactPhotoCandidates(logoUrl: string, origin: string) {
  if (!logoUrl) return [];
  if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
    const contact = logoUrl.replace(/\.[a-z0-9]+$/i, "-contact.jpg");
    return [...new Set([contact, logoUrl])].map((path) => `${origin}${path}`);
  }
  return logoUrl.startsWith("https://") ? [logoUrl] : [];
}

function photoType(contentType: string | null): VCardPhoto["type"] | undefined {
  if (!contentType) return undefined;
  if (contentType.startsWith("image/jpeg")) return "JPEG";
  if (contentType.startsWith("image/png")) return "PNG";
  return undefined;
}

/** Primeira candidata que responde como JPEG/PNG dentro do limite; senão, nenhuma. */
export async function resolveContactPhoto(
  logoUrl: string,
  origin: string,
): Promise<VCardPhoto | undefined> {
  for (const url of contactPhotoCandidates(logoUrl, origin)) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(3000),
        next: { revalidate: 3600 },
      });
      const type = photoType(response.headers.get("content-type"));
      if (!response.ok || !type) continue;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_PHOTO_BYTES) continue;
      return { type, base64: Buffer.from(bytes).toString("base64") };
    } catch {
      // Foto é opcional: falha de rede ou timeout não pode derrubar o contato.
    }
  }
  return undefined;
}
