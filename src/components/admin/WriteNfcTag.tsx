"use client";

import { useEffect, useRef, useState } from "react";

// Web NFC (NDEFReader) só existe no Chrome para Android, em HTTPS. Os tipos não
// estão no lib.dom do TypeScript, então declaramos só o que usamos.
type NdefWriter = {
  write: (
    message: { records: Array<{ recordType: "url"; data: string }> },
    options?: { overwrite?: boolean; signal?: AbortSignal },
  ) => Promise<void>;
};
type NdefWindow = Window & { NDEFReader?: new () => NdefWriter };

type State = "idle" | "waiting" | "done" | "error" | "unsupported";

type WriteNfcTagProps = {
  url: string;
  compact?: boolean;
};

/**
 * Grava a URL do cartão direto na tag NFC, pelo próprio painel: abre no
 * celular, toca em "Gravar no cartão" e aproxima a tag. Sem suporte (iPhone,
 * desktop), explica o caminho alternativo em vez de mostrar um botão morto.
 */
export function WriteNfcTag({ url, compact = false }: WriteNfcTagProps) {
  const [state, setState] = useState<State>("idle");
  const [supported, setSupported] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSupported(typeof (window as NdefWindow).NDEFReader === "function");
    return () => abortRef.current?.abort();
  }, []);

  async function write() {
    const Reader = (window as NdefWindow).NDEFReader;
    if (!Reader) {
      setState("unsupported");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    // Sem tag aproximada em 30 s, desiste: o botão não fica preso esperando.
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    setState("waiting");

    try {
      await new Reader().write(
        { records: [{ recordType: "url", data: url }] },
        { overwrite: true, signal: controller.signal },
      );
      setState("done");
    } catch {
      setState(controller.signal.aborted ? "idle" : "error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setState("idle");
  }

  const label = {
    idle: "Gravar no cartão",
    waiting: "Aproxime o cartão…",
    done: "Cartão gravado",
    error: "Não gravou. Tentar de novo",
    unsupported: "Gravar no cartão",
  }[state];

  return (
    <div className={`admin-nfc-write${compact ? " admin-nfc-write--compact" : ""}`}>
      <button
        type="button"
        className="admin-copy-button admin-nfc-write__button"
        onClick={state === "waiting" ? cancel : write}
        aria-live="polite"
        data-state={state}
      >
        <span>{label}</span>
        <i aria-hidden="true">{state === "done" ? "✓" : state === "waiting" ? "×" : "◉"}</i>
      </button>
      {state === "waiting" ? (
        <p className="admin-nfc-write__hint">
          Encoste a tag no verso do celular e segure até confirmar. Toque de novo para cancelar.
        </p>
      ) : null}
      {(supported === false && !compact) || state === "unsupported" ? (
        <p className="admin-nfc-write__hint">
          A gravação direta funciona no Chrome para Android. No iPhone, copie a URL e grave com um app como o NFC Tools.
        </p>
      ) : null}
    </div>
  );
}
