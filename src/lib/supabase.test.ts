import { describe, expect, it } from "vitest";
import { mapServices } from "@/lib/supabase";
import { MAX_SERVICES } from "@/types/profile";

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
