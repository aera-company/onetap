"use client";

import { useEffect } from "react";

type ProfileErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// O perfil falha fechado: se o Supabase não responder, é melhor mostrar
// indisponibilidade do que servir dados locais possivelmente desatualizados.
export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    console.error("[profile] Render failed", error);
  }, [error]);

  return (
    <main className="state-page">
      <div className="state-page__mark" aria-label="AERA One Tap"><span className="aera-mark" aria-hidden="true" /><span className="wordmark__product">One Tap</span></div>
      <div>
        <p className="eyebrow">Indisponível no momento</p>
        <h1>Não conseguimos carregar este perfil.</h1>
        <p>
          A falha é temporária. Tente novamente em alguns instantes ou peça um
          novo acesso ao responsável.
        </p>
      </div>
      <button type="button" onClick={reset}>
        Tentar novamente <span aria-hidden="true">↻</span>
      </button>
    </main>
  );
}
