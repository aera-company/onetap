import { describe, expect, it } from "vitest";
import { contactPhotoCandidates } from "@/lib/contact-photo";

const origin = "https://onetap.example";

describe("contactPhotoCandidates", () => {
  it("prefere a versão -contact.jpg de um símbolo interno", () => {
    expect(contactPhotoCandidates("/brand/aera-symbol.png", origin)).toEqual([
      "https://onetap.example/brand/aera-symbol-contact.jpg",
      "https://onetap.example/brand/aera-symbol.png",
    ]);
  });

  it("aceita URL externa só em https", () => {
    expect(contactPhotoCandidates("https://cdn.example/logo.jpg", origin)).toEqual([
      "https://cdn.example/logo.jpg",
    ]);
    expect(contactPhotoCandidates("http://cdn.example/logo.jpg", origin)).toEqual([]);
    expect(contactPhotoCandidates("//cdn.example/logo.jpg", origin)).toEqual([]);
  });

  it("sem símbolo, sem foto", () => {
    expect(contactPhotoCandidates("", origin)).toEqual([]);
  });
});
