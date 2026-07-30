"use client";

import { useState } from "react";

type CopyCardUrlProps = {
  url: string;
  compact?: boolean;
};

export function CopyCardUrl({ url, compact = false }: CopyCardUrlProps) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className={`admin-copy-button${compact ? " admin-copy-button--compact" : ""}`}
      type="button"
      onClick={copyUrl}
    >
      <span>{copied ? "URL copiada" : "Copiar URL para NFC"}</span>
      <i aria-hidden="true">{copied ? "✓" : "⧉"}</i>
    </button>
  );
}
