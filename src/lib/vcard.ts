import type { Profile } from "@/types/profile";

function escapeVCardValue(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function createVCard(profile: Profile) {
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

  lines.push(`NOTE:${escapeVCardValue(profile.headline)}`, "END:VCARD");

  return `${lines.join("\r\n")}\r\n`;
}
