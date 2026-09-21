import { describe, expect, it } from "vitest";
import { createVCard, foldVCardLine } from "@/lib/vcard";
import type { Profile } from "@/types/profile";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "58c365e5-5c33-49e3-b5f8-c718aa616559",
    slug: "tiago",
    name: "Tiago Lima",
    initials: "TL",
    role: "CEO",
    company: "AERA",
    headline: "Uma frase",
    bio: "",
    logoUrl: "",
    email: "",
    phone: "",
    website: "",
    instagramUrl: "",
    linkedinUrl: "",
    whatsappNumber: "",
    whatsappMessage: "",
    presentationUrl: "",
    calendarUrl: "",
    isActive: true,
    leadsEnabled: true,
    services: [],
    ...overrides,
  };
}

function lines(vcard: string) {
  return vcard.split("\r\n");
}

describe("createVCard", () => {
  it("abre e fecha o cartão com CRLF", () => {
    const vcard = createVCard(makeProfile());

    expect(vcard.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(vcard.endsWith("END:VCARD\r\n")).toBe(true);
  });

  it("separa sobrenome e nome", () => {
    expect(lines(createVCard(makeProfile()))).toContain("N:Lima;Tiago;;;");
  });

  it("trata nome composto e nome único", () => {
    expect(lines(createVCard(makeProfile({ name: "Ana Paula De Souza" })))).toContain(
      "N:Paula De Souza;Ana;;;",
    );
    expect(lines(createVCard(makeProfile({ name: "Prince" })))).toContain(
      "N:;Prince;;;",
    );
  });

  it("omite campos vazios", () => {
    const vcard = createVCard(makeProfile());

    expect(vcard).not.toContain("TEL");
    expect(vcard).not.toContain("EMAIL");
    expect(vcard).not.toContain("URL:");
    expect(vcard).not.toContain("X-SOCIALPROFILE");
  });

  it("inclui os campos preenchidos", () => {
    const vcard = createVCard(
      makeProfile({
        phone: "+5521999999999",
        email: "a@b.com",
        website: "https://exemplo.com",
        linkedinUrl: "https://linkedin.com/in/x",
      }),
    );

    expect(vcard).toContain("TEL;TYPE=CELL:+5521999999999");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET:a@b.com");
    expect(vcard).toContain("URL:https://exemplo.com");
    expect(vcard).toContain("X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/x");
  });

  it("escapa vírgula, ponto e vírgula, contrabarra e quebra de linha", () => {
    const vcard = createVCard(
      makeProfile({
        company: "Aera, Studio; Ltda\\Co",
        headline: "linha um\nlinha dois",
      }),
    );

    expect(vcard).toContain("ORG:Aera\\, Studio\\; Ltda\\\\Co");
    expect(vcard).toContain("NOTE:linha um\\nlinha dois");
  });

  it("não deixa a quebra de linha crua romper o formato", () => {
    // Uma quebra não escapada encerraria a propriedade e corromperia o cartão.
    const vcard = createVCard(makeProfile({ headline: "a\nb" }));

    expect(lines(vcard).filter((line) => line.startsWith("NOTE:"))).toHaveLength(1);
    expect(lines(vcard).every((line) => !line.includes("\n"))).toBe(true);
  });

  it("inclui a foto e dobra linhas longas", () => {
    const base64 = "A".repeat(300);
    const vcard = createVCard(makeProfile(), { type: "JPEG", base64 });

    expect(vcard).toContain("PHOTO;ENCODING=b;TYPE=JPEG:");
    for (const line of lines(vcard)) expect(line.length).toBeLessThanOrEqual(75);
    // Desdobrar (tirar CRLF + espaço) devolve o base64 inteiro.
    expect(vcard.replaceAll("\r\n ", "")).toContain(base64);
  });
});

describe("foldVCardLine", () => {
  it("não mexe em linhas curtas", () => {
    expect(foldVCardLine("FN:Tiago Lima")).toBe("FN:Tiago Lima");
  });

  it("continua com espaço a cada 74 caracteres depois dos primeiros 75", () => {
    const folded = foldVCardLine("X".repeat(200)).split("\r\n");

    expect(folded[0]).toHaveLength(75);
    expect(folded.slice(1).every((part) => part.startsWith(" "))).toBe(true);
    expect(folded.map((part, i) => (i ? part.slice(1) : part)).join("")).toBe("X".repeat(200));
  });
});

