import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, isAdminConfigured } from "@/lib/admin-auth";
import { hasAnyAdminUser } from "@/lib/supabase";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await getAdminSession()) redirect("/admin/dashboard");

  const { error } = await searchParams;
  const configured = isAdminConfigured();

  // Sem nenhum administrador cadastrado, "senha incorreta" seria enganoso.
  const hasAdminUser = configured
    ? await hasAnyAdminUser().catch(() => true)
    : false;

  return (
    <main className="admin-login">
      <section className="admin-login__intro">
        <Link className="admin-login__brand" href="/">
          <span className="aera-mark admin-brand__mark" aria-hidden="true" />
          <span className="admin-login__product">One Tap</span>
        </Link>
        <div>
          <p className="admin-kicker">AERA · Control room</p>
          <h1>Encontros viram sinais.</h1>
          <p>
            Acompanhe cada aproximação, entenda as ações que geram conexão e
            mantenha sua apresentação sempre atualizada.
          </p>
        </div>
        <span className="admin-login__caption">
          Um toque. Uma conexão mensurável.
        </span>
      </section>

      <section className="admin-login__form-wrap">
        <form className="admin-login__form" action="/api/admin/login" method="post">
          <div className="admin-login__signal" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="admin-kicker">Acesso reservado</p>
          <h2>Entrar no painel</h2>
          <p className="admin-login__helper">
            Use as credenciais administrativas do One Tap.
          </p>

          {error === "invalid" ? (
            <p className="admin-form-message admin-form-message--error">
              E-mail ou senha incorretos. Revise os dados e tente novamente.
            </p>
          ) : null}
          {error === "limite" ? (
            <p className="admin-form-message admin-form-message--error">
              Muitas tentativas deste dispositivo. Aguarde alguns minutos antes
              de tentar de novo.
            </p>
          ) : null}
          {error === "unavailable" ? (
            <p className="admin-form-message admin-form-message--error">
              Não foi possível validar o acesso agora. Tente novamente em
              instantes.
            </p>
          ) : null}
          {!configured || error === "config" ? (
            <p className="admin-form-message admin-form-message--error">
              O acesso administrativo ainda não foi configurado no servidor.
            </p>
          ) : null}
          {configured && !hasAdminUser ? (
            <p className="admin-form-message admin-form-message--error">
              Nenhum administrador cadastrado. Rode <code>npm run create-admin</code>{" "}
              para criar o primeiro acesso.
            </p>
          ) : null}

          <label className="admin-field">
            <span>E-mail</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="voce@empresa.com"
              required
            />
          </label>
          <label className="admin-field">
            <span>Senha</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              required
            />
          </label>
          <button className="admin-button admin-button--primary" type="submit">
            Acessar painel
            <span aria-hidden="true">↗</span>
          </button>
          <a className="admin-login__back" href="/privacidade">
            Política de privacidade
          </a>
        </form>
      </section>
    </main>
  );
}
