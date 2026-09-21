import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("hashPassword", () => {
  it("produz o formato scrypt$N$r$p$salt$hash", async () => {
    const stored = await hashPassword("uma-senha-qualquer");
    const parts = stored.split("$");

    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
    expect(Number(parts[1])).toBeGreaterThanOrEqual(16384);
  });

  it("usa salt novo a cada chamada", async () => {
    const [a, b] = await Promise.all([
      hashPassword("mesma-senha"),
      hashPassword("mesma-senha"),
    ]);

    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("aceita a senha correta", async () => {
    const stored = await hashPassword("senha-correta-aqui");
    await expect(verifyPassword("senha-correta-aqui", stored)).resolves.toBe(true);
  });

  it("recusa a senha errada", async () => {
    const stored = await hashPassword("senha-correta-aqui");
    await expect(verifyPassword("senha-errada-aqui", stored)).resolves.toBe(false);
  });

  it("é sensível a maiúsculas e a espaços nas pontas", async () => {
    const stored = await hashPassword("Senha Com Caixa");

    await expect(verifyPassword("senha com caixa", stored)).resolves.toBe(false);
    await expect(verifyPassword(" Senha Com Caixa ", stored)).resolves.toBe(false);
  });

  it("recusa hashes malformados sem lançar", async () => {
    const malformados = [
      "",
      "lixo",
      "scrypt$16384$8$1$soh-cinco-campos",
      "bcrypt$16384$8$1$c2FsdA==$aGFzaA==",
      "scrypt$16384$8$1$$",
      "scrypt$abc$def$ghi$c2FsdA==$aGFzaA==",
    ];

    for (const stored of malformados) {
      await expect(verifyPassword("qualquer", stored)).resolves.toBe(false);
    }
  });

  it("verifica um hash gerado com outros parâmetros de custo", async () => {
    // Os parâmetros vêm gravados no próprio hash, então um custo antigo
    // continua verificável depois de mudarmos o padrão.
    const stored = await hashPassword("senha-portatil");
    const [, cost, block, parallel] = stored.split("$");

    expect({ cost, block, parallel }).toEqual({
      cost: "16384",
      block: "8",
      parallel: "1",
    });
    await expect(verifyPassword("senha-portatil", stored)).resolves.toBe(true);
  });
});
