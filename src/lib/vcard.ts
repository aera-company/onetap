import type { Profile } from "@/types/profile";

function escapeVCardValue(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

/** Foto do contato já em base64 (JPEG ou PNG), resolvida pela rota. */
export type VCardPhoto = {
  type: "JPEG" | "PNG";
  base64: string;
};

/**
 * RFC 2425/6350: linhas longas são dobradas a cada 75 caracteres, e cada
 * continuação começa com um espaço. Sem isso, a foto em base64 (uma linha de
 * milhares de caracteres) é recusada por alguns importadores de agenda.
 */
export function foldVCardLine(line: string) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(` ${line.slice(i, i + 74)}`);
  return parts.join("\r\n");
}

export function createVCard(profile: Profile, photo?: VCardPhoto) {
  const [firstName, ...lastNameParts] = profile.name.split(" ");
  const lastName = lastNameParts.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`,
    `FN:${escapeVCardValue(profile.name)}`,
    `ORG:${escapeVCardValue(profile.company)}`,
    `TITLE:${escapeVCardValue(profile.role)}`,
  ];

  if (profile.phone) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(profile.phone)}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(profile.email)}`);
  if (profile.website) lines.push(`URL:${escapeVCardValue(profile.website)}`);
  if (profile.linkedinUrl) {
    lines.push(
      `X-SOCIALPROFILE;TYPE=linkedin:${escapeVCardValue(profile.linkedinUrl)}`,
    );
  }

  if (photo) lines.push(`PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.base64}`);

  lines.push(`NOTE:${escapeVCardValue(profile.headline)}`, "END:VCARD");

  return `${lines.map(foldVCardLine).join("\r\n")}\r\n`;
}
