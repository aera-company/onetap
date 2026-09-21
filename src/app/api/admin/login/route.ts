import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/password";
import { allowRequest, isSameOrigin } from "@/lib/rate-limit";
import { getAdminUserByEmail } from "@/lib/supabase";

// Hash descartável, usado quando o e-mail não existe: verificamos algo de
// qualquer jeito para que o tempo de resposta não revele quais e-mails existem.
const DUMMY_HASH =
  "scrypt$16384$8$1$yNye+Li283RiUNfKzGMjRQ==$E6UmGXbHA0pJ7NwF9RLLvFfUL1hfsXEeCAGV//sjxYekNnUpW8D0B4ZOwMALqj3eQdTpjKgUHY9rP2ProAFBEg==";

// 20 tentativas a cada 15 minutos por IP. Folgado para quem erra a senha,
// e reduz a força bruta a ~2 mil tentativas por dia contra um hash scrypt.
const ATTEMPT_LIMIT = 20;
const ATTEMPT_WINDOW_SECONDS = 15 * 60;

export async function POST(request: NextRequest) {
  // Sem isso, um site externo poderia postar este formulário e logar a vítima
  // numa conta escolhida pelo atacante.
  if (!isSameOrigin(request)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), 303);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url), 303);
  }

  // Antes de qualquer trabalho: o scrypt custa ~100 ms de CPU por tentativa e
  // é, ele próprio, o vetor de exaustão que precisamos conter.
  if (
    !(await allowRequest(
      request,
      "login",
      ATTEMPT_LIMIT,
      ATTEMPT_WINDOW_SECONDS,
    ))
  ) {
    return NextResponse.redirect(new URL("/admin?error=limite", request.url), 303);
  }

  let user;
  try {
    user = await getAdminUserByEmail(email);
  } catch (error) {
    console.error("[admin] Login lookup failed", error);
    return NextResponse.redirect(
      new URL("/admin?error=unavailable", request.url),
      303,
    );
  }

  const passwordMatches = await verifyPassword(
    password,
    user?.password_hash ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(
    new URL("/admin/dashboard", request.url),
    303,
  );
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    await createAdminSession({ userId: user.id, email: user.email }),
    adminCookieOptions,
  );
  return response;
}
