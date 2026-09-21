"use client";

import { useEffect, useRef, useState } from "react";

type ShowQrProps = {
  /** SVG gerado no servidor pela biblioteca qrcode (conteúdo nosso, não do usuário). */
  svg: string;
  url: string;
  name: string;
};

/**
 * Mostra o QR do próprio cartão em tela cheia, para quem recebeu passar
 * adiante ou para um celular sem NFC escanear ali mesmo. Usa <dialog>: Esc
 * fecha, o foco fica preso dentro e volta ao botão ao fechar.
 */
export function ShowQr({ svg, url, name }: ShowQrProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function share() {
    try {
      await navigator.share({ title: name, url });
    } catch {
      // Cancelar o compartilhamento não é erro.
    }
  }

  return (
    <>
      <button
        type="button"
        className="action-link action-link--button"
        onClick={() => dialogRef.current?.showModal()}
      >
        <span className="action-link__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2" strokeLinecap="square" />
          </svg>
        </span>
        <span className="action-link__copy">
          Mostrar QR
          <small>Para passar adiante</small>
        </span>
        <span className="action-link__arrow" aria-hidden="true">
          ↗
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="qr-sheet"
        aria-label={`QR Code de ${name}`}
        onClick={(event) => {
          // Toque fora do quadro fecha.
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="qr-sheet__body">
          <p className="eyebrow">Aponte a câmera</p>
          <div className="qr-sheet__code" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="qr-sheet__name">{name}</p>
          <div className="qr-sheet__actions">
            {canShare ? (
              <button type="button" onClick={share}>
                Compartilhar link
              </button>
            ) : null}
            <button type="button" onClick={() => dialogRef.current?.close()} autoFocus>
              Fechar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
