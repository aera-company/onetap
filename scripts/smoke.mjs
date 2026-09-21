#!/usr/bin/env node
// Sobe o build de produção e confere que as rotas principais respondem.
//
// Existe porque um erro real passou por typecheck, lint, testes e build: a
// página do perfil só quebrava com `next start`, não em desenvolvimento.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = "http://127.0.0.1:3000";
const ESPERADO = [
  ["/t/tiago", 200],
  ["/t/tiago?card=aera-tiago-001", 200],
  ["/t/tiago?lead=ok", 200],
  ["/t/inexistente", 404],
  ["/t/tiago/contact.vcf", 200],
  ["/admin", 200],
  ["/privacidade", 200],
  ["/offline", 200],
  ["/manifest.webmanifest", 200],
  // Sem sessão, o middleware precisa barrar tudo do painel.
  ["/admin/dashboard", 307],
  ["/admin/leads", 307],
];

const server = spawn("npm", ["run", "start"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" },
});

let saida = "";
server.stdout.on("data", (c) => (saida += c));
server.stderr.on("data", (c) => (saida += c));

async function aguardarServidor() {
  for (let tentativa = 0; tentativa < 60; tentativa += 1) {
    try {
      await fetch(`${BASE}/admin`, { redirect: "manual" });
      return true;
    } catch {
      await sleep(500);
    }
  }
  return false;
}

let falhas = 0;

try {
  if (!await aguardarServidor()) {
    console.error("O servidor não subiu.\n", saida);
    process.exit(1);
  }

  for (const [rota, esperado] of ESPERADO) {
    const resposta = await fetch(`${BASE}${rota}`, { redirect: "manual" });
    const ok = resposta.status === esperado;
    if (!ok) falhas += 1;
    console.log(
      `  ${ok ? "ok  " : "FALHA"} ${rota.padEnd(34)} ${resposta.status} (esperado ${esperado})`,
    );
  }

  // A CSP de produção não pode liberar eval: em produção o Next não precisa,
  // e liberar aqui enfraqueceria a política sem ninguém perceber.
  const csp = (await fetch(`${BASE}/t/tiago`)).headers.get(
    "content-security-policy",
  );
  if (!csp || csp.includes("unsafe-eval")) {
    console.log("  FALHA CSP de produção ausente ou com 'unsafe-eval'");
    falhas += 1;
  } else {
    console.log("  ok   CSP de produção sem 'unsafe-eval'");
  }
} finally {
  server.kill("SIGTERM");
}

if (falhas) {
  console.error(`\n${falhas} verificação(ões) falharam.`);
  process.exit(1);
}
console.log("\nSmoke de produção OK.");
