import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { getClientIp, isSameOrigin } from "@/lib/rate-limit";

function makeRequest(headers: Record<string, string>, host = "onetap.app") {
  const store = new Headers(headers);
  return {
    headers: store,
    nextUrl: { host },
  } as unknown as NextRequest;
}

describe("getClientIp", () => {
  it("prefere x-real-ip", () => {
    expect(
      getClientIp(
        makeRequest({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("usa a primeira entrada de x-forwarded-for", () => {
    expect(
      getClientIp(makeRequest({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" })),
    ).toBe("203.0.113.7");
  });

  it("ignora espaços em volta", () => {
    expect(getClientIp(makeRequest({ "x-forwarded-for": "  203.0.113.7 , x" }))).toBe(
      "203.0.113.7",
    );
  });

  it("devolve vazio sem cabeçalho algum", () => {
    expect(getClientIp(makeRequest({}))).toBe("");
  });
});

describe("isSameOrigin", () => {
  it("aceita origem igual ao host", () => {
    expect(
      isSameOrigin(
        makeRequest({ origin: "https://onetap.app", host: "onetap.app" }),
      ),
    ).toBe(true);
  });

  it("recusa origem de outro host", () => {
    expect(
      isSameOrigin(makeRequest({ origin: "https://evil.com", host: "onetap.app" })),
    ).toBe(false);
  });

  it("recusa subdomínio parecido", () => {
    expect(
      isSameOrigin(
        makeRequest({ origin: "https://onetap.app.evil.com", host: "onetap.app" }),
      ),
    ).toBe(false);
  });

  it("compara incluindo a porta", () => {
    expect(
      isSameOrigin(
        makeRequest({ origin: "http://localhost:3000", host: "localhost:3000" }),
      ),
    ).toBe(true);
    expect(
      isSameOrigin(
        makeRequest({ origin: "http://localhost:4000", host: "localhost:3000" }),
      ),
    ).toBe(false);
  });

  it("passa quando o cliente não envia Origin", () => {
    // Alguns beacons não mandam o cabeçalho; bloquear perderia evento legítimo.
    expect(isSameOrigin(makeRequest({ host: "onetap.app" }))).toBe(true);
  });

  it("recusa Origin malformada", () => {
    expect(
      isSameOrigin(makeRequest({ origin: "nao-e-url", host: "onetap.app" })),
    ).toBe(false);
  });

  it("cai no host do nextUrl quando não há cabeçalho host", () => {
    expect(
      isSameOrigin(makeRequest({ origin: "https://onetap.app" }, "onetap.app")),
    ).toBe(true);
  });
});
