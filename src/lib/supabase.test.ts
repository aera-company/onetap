import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRuntimeCard,
  getRuntimeProfile,
  mapServices,
} from "@/lib/supabase";
import { MAX_SERVICES } from "@/types/profile";

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalSupabaseKey = process.env.SUPABASE_SECRET_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalSupabaseUrl;

  if (originalSupabaseKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
  else process.env.SUPABASE_SECRET_KEY = originalSupabaseKey;
});

// O jsonb vem do banco sem garantia de formato: pode ter sido editado à mão,
// migrado de outra estrutura ou simplesmente estar nulo.
describe("mapServices", () => {
  it("mapeia a lista bem formada", () => {
    expect(
      mapServices([{ title: "Estratégia", detail: "Clareza para marcas." }]),
    ).toEqual([{ title: "Estratégia", detail: "Clareza para marcas." }]);
  });

  it("devolve lista vazia para valores que não são array", () => {
    for (const value of [null, undefined, {}, "texto", 42, true]) {
      expect(mapServices(value)).toEqual([]);
    }
  });

  it("descarta itens sem título", () => {
    expect(
      mapServices([
        { title: "", detail: "sem titulo" },
        { detail: "só detalhe" },
        { title: "Válido", detail: "ok" },
      ]),
    ).toEqual([{ title: "Válido", detail: "ok" }]);
  });

  it("descarta entradas que não são objetos", () => {
    expect(mapServices(["texto", 1, null, ["x"], { title: "Ok", detail: "" }])).toEqual([
      { title: "Ok", detail: "" },
    ]);
  });

  it("normaliza detalhe ausente ou de outro tipo para string vazia", () => {
    expect(mapServices([{ title: "A" }, { title: "B", detail: 42 }])).toEqual([
      { title: "A", detail: "" },
      { title: "B", detail: "" },
    ]);
  });

  it("limita ao máximo de serviços editáveis", () => {
    const excesso = Array.from({ length: MAX_SERVICES + 3 }, (_, i) => ({
      title: `Serviço ${i}`,
      detail: "",
    }));

    expect(mapServices(excesso)).toHaveLength(MAX_SERVICES);
  });
});

describe("contingência pública do Supabase", () => {
  it("mantém perfil e cartão pessoais disponíveis numa falha de DNS", async () => {
    process.env.SUPABASE_URL = "https://indisponivel.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_teste";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        Object.assign(new TypeError("fetch failed"), {
          cause: { code: "ENOTFOUND" },
        }),
      ),
    );

    const profile = await getRuntimeProfile("tiago");
    const card = await getRuntimeCard("aera-tiago-001");

    expect(profile).toMatchObject({ slug: "tiago", leadsEnabled: false });
    expect(card).toMatchObject({ code: "aera-tiago-001", isActive: true });
  });

  it("não mascara erros HTTP do banco", async () => {
    process.env.SUPABASE_URL = "https://configurado.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_teste";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "sem permissão",
      }),
    );

    await expect(getRuntimeProfile("tiago")).rejects.toThrow(
      "Supabase respondeu 403",
    );
  });
});
