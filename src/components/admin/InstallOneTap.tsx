"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallOneTap() {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

    setIsStandalone(standalone);
    setIsIos(ios);

    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  if (isStandalone || (!isIos && !installPrompt)) return null;

  return (
    <>
      <button className="admin-install-app" type="button" onClick={install}>
        <span className="admin-install-app__icon" aria-hidden="true">
          ↑
        </span>
        <span>
          <strong>Instalar One Tap</strong>
          <small>Abrir como app</small>
        </span>
      </button>

      {showIosGuide ? (
        <div
          className="admin-install-guide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <button
            className="admin-install-guide__backdrop"
            type="button"
            aria-label="Fechar instruções"
            onClick={() => setShowIosGuide(false)}
          />
          <div className="admin-install-guide__card">
            <div className="admin-install-guide__mark" aria-hidden="true">
              <span>↑</span>
            </div>
            <p className="admin-kicker">Instalar no iPhone</p>
            <h2 id="install-guide-title">One Tap na sua tela inicial.</h2>
            <ol>
              <li>
                Abra esta página no <strong>Safari</strong>.
              </li>
              <li>
                Toque em <strong>Compartilhar</strong>.
              </li>
              <li>
                Selecione <strong>Adicionar à Tela de Início</strong>.
              </li>
              <li>
                Ative <strong>Abrir como App da Web</strong> e toque em Adicionar.
              </li>
            </ol>
            <button
              className="admin-button admin-button--primary"
              type="button"
              onClick={() => setShowIosGuide(false)}
            >
              Entendi <span aria-hidden="true">✓</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
