import { describe, expect, it } from "vitest";
import { buildWhatsappUrl } from "@/lib/whatsapp";

describe("buildWhatsappUrl", () => {
  it("remove máscara do número", () => {
    expect(buildWhatsappUrl("+55 (21) 99683-6847", "oi")).toBe(
      "https://wa.me/5521996836847?text=oi",
    );
  });

  it("escapa a mensagem", () => {
    expect(buildWhatsappUrl("5521999999999", "olá & tudo bem?")).toBe(
      "https://wa.me/5521999999999?text=ol%C3%A1%20%26%20tudo%20bem%3F",
    );
  });

  it("devolve null sem número utilizável", () => {
    expect(buildWhatsappUrl("", "oi")).toBeNull();
    expect(buildWhatsappUrl("   ", "oi")).toBeNull();
    expect(buildWhatsappUrl("(--)", "oi")).toBeNull();
  });

  it("aceita mensagem vazia", () => {
    expect(buildWhatsappUrl("5521999999999", "")).toBe(
      "https://wa.me/5521999999999?text=",
    );
  });
});
