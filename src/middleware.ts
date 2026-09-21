import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";

/**
 * Defesa em profundidade: cada página e rota do painel já confere a sessão por
 * conta própria, mas isso depende de ninguém esquecer numa rota nova. Aqui o
 * bloqueio é estrutural — só `/admin` (login) e o próprio login/logout passam
 * sem sessão.
 *
 * A verificação é só da assinatura e do prazo do cookie, sem ida ao banco: o
 * middleware roda em todas as requisições e a autorização de verdade (qual
 * perfil este usuário administra) continua nas rotas.
 */
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin",
  "/api/admin/login",
  "/api/admin/logout",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const session = await verifyAdminSession(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value,
  );
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
