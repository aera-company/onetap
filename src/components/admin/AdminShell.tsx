import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AdminShellProps = {
  active: "dashboard" | "cards" | "profile";
  children: ReactNode;
  profileName?: string;
};

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h2m3-5v10m4-13v16m4-11v6m3-3h1" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M7 14c1.6-1.6 1.6-4.4 0-6m3 8.5c3-3 3-8 0-11" />
    </svg>
  );
}

export function AdminShell({
  active,
  children,
  profileName = "Tiago Lima",
}: AdminShellProps) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div>
          <Link className="admin-brand" href="/admin/dashboard">
            <span className="admin-brand__symbol">
              <Image
                src="/brand/aera-symbol.png"
                alt=""
                width={26}
                height={26}
              />
            </span>
            <span>
              <strong>ONE TAP</strong>
              <small>Control room</small>
            </span>
          </Link>

          <nav className="admin-nav" aria-label="Painel administrativo">
            <p>Gerenciar</p>
            <Link
              className={active === "dashboard" ? "is-active" : ""}
              href="/admin/dashboard"
            >
              <SignalIcon />
              Visão geral
            </Link>
            <Link
              className={active === "cards" ? "is-active" : ""}
              href="/admin/cards"
            >
              <CardIcon />
              Cartões
            </Link>
            <Link
              className={active === "profile" ? "is-active" : ""}
              href="/admin/profile"
            >
              <ProfileIcon />
              Perfil público
            </Link>
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-operator">
            <span>{profileName.slice(0, 1)}</span>
            <div>
              <strong>{profileName}</strong>
              <small>Administrador</small>
            </div>
          </div>
          <form action="/api/admin/logout" method="post">
            <button type="submit">Sair</button>
          </form>
        </div>
      </aside>

      <main className="admin-main">{children}</main>

      <nav className="admin-mobile-nav" aria-label="Navegação móvel">
        <Link
          className={active === "dashboard" ? "is-active" : ""}
          href="/admin/dashboard"
        >
          <SignalIcon />
          Visão geral
        </Link>
        <Link
          className={active === "cards" ? "is-active" : ""}
          href="/admin/cards"
        >
          <CardIcon />
          Cartões
        </Link>
        <Link
          className={active === "profile" ? "is-active" : ""}
          href="/admin/profile"
        >
          <ProfileIcon />
          Perfil
        </Link>
      </nav>
    </div>
  );
}
