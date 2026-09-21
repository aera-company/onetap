import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminSession,
} from "@/lib/admin-auth";

const SECRET = "segredo-de-teste-para-a-sessao";
const session = { userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", email: "a@b.com" };

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}

function encode(claims: Record<string, unknown>) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
}

function decode(token: string) {
  return JSON.parse(fromBase64Url(token.split(".")[0]));
}

/** Assina um payload arbitrário, para montar tokens que o app nunca emitiria. */
async function signWith(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SECRET_KEY;
});

describe("createAdminSession + verifyAdminSession", () => {
  it("faz ida e volta preservando usuário e e-mail", async () => {
    const token = await createAdminSession(session);
    await expect(verifyAdminSession(token)).resolves.toEqual(session);
  });

  it("recusa token assinado com outro segredo", async () => {
    const token = await createAdminSession(session);
    const forjado = await signWith("outro-segredo", token.split(".")[0]);

    await expect(verifyAdminSession(forjado)).resolves.toBeNull();
  });

  it("recusa payload adulterado mantendo a assinatura antiga", async () => {
    const token = await createAdminSession(session);
    const claims = decode(token);
    claims.userId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

    await expect(
      verifyAdminSession(`${encode(claims)}.${token.split(".")[1]}`),
    ).resolves.toBeNull();
  });

  it("recusa sessão expirada mesmo com assinatura válida", async () => {
    const token = await signWith(
      SECRET,
      encode({ ...session, expiresAt: Date.now() - 1000 }),
    );

    await expect(verifyAdminSession(token)).resolves.toBeNull();
  });

  it("recusa token sem assinatura, vazio ou indefinido", async () => {
    const payload = (await createAdminSession(session)).split(".")[0];

    await expect(verifyAdminSession(`${payload}.`)).resolves.toBeNull();
    await expect(verifyAdminSession(payload)).resolves.toBeNull();
    await expect(verifyAdminSession("")).resolves.toBeNull();
    await expect(verifyAdminSession(undefined)).resolves.toBeNull();
  });

  it("recusa payload que não é JSON válido", async () => {
    const token = await signWith(
      SECRET,
      toBase64Url(new TextEncoder().encode("nao-e-json")),
    );

    await expect(verifyAdminSession(token)).resolves.toBeNull();
  });

  it("recusa sessão sem userId", async () => {
    const token = await signWith(
      SECRET,
      encode({ email: "a@b.com", expiresAt: Date.now() + 60_000 }),
    );

    await expect(verifyAdminSession(token)).resolves.toBeNull();
  });

  it("recusa qualquer token quando não há segredo configurado", async () => {
    const token = await createAdminSession(session);
    delete process.env.ADMIN_SESSION_SECRET;

    await expect(verifyAdminSession(token)).resolves.toBeNull();
  });

  it("não emite sessão sem segredo configurado", async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    await expect(createAdminSession(session)).rejects.toThrow();
  });

  it("expira em sete dias", async () => {
    const { expiresAt } = decode(await createAdminSession(session));
    const dias = (expiresAt - Date.now()) / (24 * 60 * 60 * 1000);

    expect(dias).toBeGreaterThan(6.9);
    expect(dias).toBeLessThanOrEqual(7);
  });
});

describe("isAdminConfigured", () => {
  it("exige o segredo da sessão e o Supabase", () => {
    expect(isAdminConfigured()).toBe(false);

    process.env.SUPABASE_URL = "https://exemplo.supabase.co";
    expect(isAdminConfigured()).toBe(false);

    process.env.SUPABASE_SECRET_KEY = "sb_secret_x";
    expect(isAdminConfigured()).toBe(true);

    delete process.env.ADMIN_SESSION_SECRET;
    expect(isAdminConfigured()).toBe(false);
  });
});
