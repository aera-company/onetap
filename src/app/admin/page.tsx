import Image from "next/image";
import { redirect } from "next/navigation";
import { hasAdminSession, isAdminConfigured } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await hasAdminSession()) redirect("/admin/dashboard");

  const { error } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <main className="admin-login">
      <section className="admin-login__intro">
        <a className="admin-login__brand" href="/t/tiago">
          <span>
            <Image
              src="/brand/aera-symbol.png"
              alt=""
              width={28}
              height={28}
              priority
            />
          </span>
          ONE TAP
        </a>
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
          {!configured || error === "config" ? (
            <p className="admin-form-message admin-form-message--error">
              O acesso administrativo ainda não foi configurado no servidor.
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
          <a className="admin-login__back" href="/t/tiago">
            Voltar ao perfil público
          </a>
        </form>
      </section>
    </main>
  );
}
