#!/usr/bin/env node
// Cadastra (ou atualiza a senha de) um administrador do painel e vincula um
// perfil a ele. Uso: npm run create-admin
//
// A senha é digitada de forma oculta e nunca passa por argumento de linha de
// comando — argv fica visível na lista de processos e no histórico do shell.

import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { hashPassword } from "../src/lib/password.ts";

async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = await readFile(file, "utf8");
      for (const line of content.split("\n")) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue.replace(/^["']|["']$/g, "");
      }
    } catch {
      // Arquivo ausente é normal.
    }
  }
}

// Uma única interface para todas as perguntas: fechar e reabrir a readline
// entre perguntas descarta o que já estava no buffer do stdin.
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

let hideInput = false;
const echo = rl._writeToOutput.bind(rl);
rl._writeToOutput = (chunk) => {
  if (!hideInput) echo(chunk);
};

function ask(prompt, { hidden = false } = {}) {
  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(prompt, (answer) => resolve(answer.trim()));
      return;
    }

    // O prompt é escrito direto no stdout e só então o eco é silenciado,
    // para que a senha digitada nunca apareça na tela.
    process.stdout.write(prompt);
    hideInput = true;
    rl.question("", (answer) => {
      hideInput = false;
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

function supabase(path, init = {}) {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Defina SUPABASE_URL e SUPABASE_SECRET_KEY em .env.local antes de rodar.",
    );
  }

  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    ...(init.prefer ? { Prefer: init.prefer } : {}),
    ...init.headers,
  };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;

  return fetch(`${url}/rest/v1/${path}`, { ...init, headers }).then(
    async (response) => {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Supabase ${response.status}: ${text.slice(0, 400)}`);
      }
      return text ? JSON.parse(text) : null;
    },
  );
}

async function main() {
  await loadEnv();

  const email = (await ask("E-mail do administrador: ")).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("E-mail inválido.");
  }

  const password = await ask("Senha: ", { hidden: true });
  if (password.length < 12) {
    throw new Error("Use uma senha de pelo menos 12 caracteres.");
  }
  const confirmation = await ask("Confirme a senha: ", { hidden: true });
  if (password !== confirmation) throw new Error("As senhas não conferem.");

  const slug = (await ask("Slug do perfil (ex.: tiago): ")).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug inválido. Use letras minúsculas, números e hífens.");
  }

  const passwordHash = await hashPassword(password);

  const existingUsers = await supabase(
    `admin_users?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
  );

  let userId;
  if (existingUsers.length) {
    userId = existingUsers[0].id;
    await supabase(`admin_users?id=eq.${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ password_hash: passwordHash }),
    });
    console.log(`\nSenha atualizada para ${email}.`);
  } else {
    const created = await supabase("admin_users", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({ email, password_hash: passwordHash }),
    });
    userId = created[0].id;
    console.log(`\nAdministrador ${email} criado.`);
  }

  const existingProfiles = await supabase(
    `profiles?select=id,slug,name,owner_id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );

  if (existingProfiles.length) {
    const profile = existingProfiles[0];
    if (profile.owner_id && profile.owner_id !== userId) {
      throw new Error(
        `O perfil "${slug}" já pertence a outro administrador. Nada foi alterado no perfil.`,
      );
    }
    await supabase(`profiles?id=eq.${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ owner_id: userId }),
    });
    console.log(`Perfil "${slug}" vinculado a ${email}.`);
  } else {
    const name = await ask("Nome exibido no perfil: ");
    if (name.length < 2) throw new Error("Informe um nome.");

    await supabase("profiles", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify({
        slug,
        name,
        owner_id: userId,
        is_active: true,
      }),
    });
    console.log(`Perfil "${slug}" criado e vinculado a ${email}.`);
  }

  console.log("\nPronto. Acesse /admin e entre com esse e-mail e senha.");
}

main()
  .catch((error) => {
    console.error(`\nErro: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
