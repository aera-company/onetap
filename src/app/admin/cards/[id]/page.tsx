import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyCardUrl } from "@/components/admin/CopyCardUrl";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminCard, getRuntimeProfile } from "@/lib/supabase";

type EditCardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://onetap-sand.vercel.app"
  );
}

export default async function EditCardPage({
  params,
  searchParams,
}: EditCardPageProps) {
  if (!(await hasAdminSession())) redirect("/admin");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [card, profile] = await Promise.all([
    getAdminCard(id),
    getRuntimeProfile("tiago", true),
  ]);
  if (!card || !profile || card.profileId !== profile.id) notFound();

  const cardUrl = `${getSiteUrl()}/t/${profile.slug}?card=${encodeURIComponent(card.code)}`;

  return (
    <AdminShell active="cards" profileName={profile.name}>
      <header className="admin-page-header admin-page-header--card-edit">
        <div>
          <p className="admin-kicker">Cartões · Editar</p>
          <h1>{card.label}</h1>
          <p>Controle a identificação, o contexto e a disponibilidade do cartão.</p>
        </div>
        <Link className="admin-button admin-button--secondary" href="/admin/cards">
          Voltar aos cartões <span aria-hidden="true">←</span>
        </Link>
      </header>

      {query.saved ? (
        <p className="admin-save-message">
          <span>✓</span>
          Cartão atualizado.
        </p>
      ) : null}
      {query.error ? (
        <p className="admin-save-message admin-save-message--error">
          Não foi possível atualizar o cartão.
        </p>
      ) : null}

      <div className="admin-card-edit-grid">
        <section className="admin-card-artifact">
          <div className="admin-physical-card admin-physical-card--large">
            <div className="admin-physical-card__top">
              <span className="admin-physical-card__brand">
                <Image
                  src="/brand/aera-symbol.png"
                  alt=""
                  width={32}
                  height={32}
                />
                ONE TAP
              </span>
              <span
                className={`admin-card-status${card.isActive ? " is-active" : ""}`}
              >
                <i />
                {card.isActive ? "Ativo" : "Pausado"}
              </span>
            </div>
            <div className="admin-physical-card__tap" aria-hidden="true">
              <span />
              <span />
              <i />
            </div>
            <div className="admin-physical-card__bottom">
              <p>{card.label}</p>
              <code>{card.code}</code>
            </div>
          </div>

          <div className="admin-qr-block">
            {/* The QR endpoint is protected and generated on demand. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/admin/cards/${card.id}/qr`}
              alt={`QR Code do cartão ${card.label}`}
              width="164"
              height="164"
            />
            <div>
              <p className="admin-kicker">QR Code</p>
              <strong>Pronto para impressão</strong>
              <a href={`/api/admin/cards/${card.id}/qr?download=1`}>
                Baixar arquivo SVG ↗
              </a>
            </div>
          </div>

          <div className="admin-card-url admin-card-url--edit">
            <span>URL para gravar no NFC</span>
            <code>{cardUrl}</code>
            <CopyCardUrl url={cardUrl} />
          </div>
        </section>

        <form
          className="admin-card-edit-form"
          action="/api/admin/cards"
          method="post"
        >
          <input type="hidden" name="action" value="update" />
          <input type="hidden" name="cardId" value={card.id} />
          <input type="hidden" name="profileId" value={profile.id} />
          <input type="hidden" name="code" value={card.code} />

          <div className="admin-card-edit-form__heading">
            <p className="admin-kicker">Configuração</p>
            <h2>Detalhes do cartão</h2>
          </div>

          <label className="admin-field">
            <span>Nome do cartão</span>
            <input name="label" defaultValue={card.label} maxLength={120} required />
          </label>
          <label className="admin-field">
            <span>Código permanente</span>
            <input value={card.code} disabled />
            <small>
              Preservado para não quebrar cartões físicos e métricas anteriores.
            </small>
          </label>
          <label className="admin-field">
            <span>Campanha ou contexto</span>
            <input
              name="campaign"
              defaultValue={card.campaign}
              maxLength={120}
            />
          </label>
          <label className="admin-field">
            <span>Local</span>
            <input
              name="location"
              defaultValue={card.location}
              maxLength={120}
            />
          </label>
          <label className="admin-switch admin-switch--card">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={card.isActive}
            />
            <span aria-hidden="true" />
            <div>
              <strong>Cartão ativo</strong>
              <small>
                {card.isActive
                  ? "O perfil abre normalmente."
                  : "A abertura está temporariamente bloqueada."}
              </small>
            </div>
          </label>
          <button className="admin-button admin-button--primary" type="submit">
            Salvar cartão <span aria-hidden="true">↗</span>
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
