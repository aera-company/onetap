import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyCardUrl } from "@/components/admin/CopyCardUrl";
import { hasAdminSession } from "@/lib/admin-auth";
import { getCardManagementData } from "@/lib/supabase";

type AdminCardsPageProps = {
  searchParams: Promise<{
    created?: string;
    error?: string;
  }>;
};

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://onetap-sand.vercel.app"
  );
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  })
    .format(new Date(value))
    .replace(".", "");
}

export default async function AdminCardsPage({
  searchParams,
}: AdminCardsPageProps) {
  if (!(await hasAdminSession())) redirect("/admin");

  const [{ profile, cards }, query] = await Promise.all([
    getCardManagementData(),
    searchParams,
  ]);
  const siteUrl = getSiteUrl();

  return (
    <AdminShell active="cards" profileName={profile.name}>
      <header className="admin-page-header admin-page-header--cards">
        <div>
          <p className="admin-kicker">Cartões · NFC + QR</p>
          <h1>Cada cartão, uma origem.</h1>
          <p>
            Crie pontos de contato rastreáveis para reuniões, eventos e
            campanhas — todos levando ao mesmo perfil.
          </p>
        </div>
        <a className="admin-button admin-button--secondary" href="#novo-cartao">
          Novo cartão <span aria-hidden="true">＋</span>
        </a>
      </header>

      {query.created ? (
        <p className="admin-save-message">
          <span>✓</span>
          Cartão criado. A URL já pode ser gravada no NFC.
        </p>
      ) : null}
      {query.error ? (
        <p className="admin-save-message admin-save-message--error">
          {query.error === "duplicate"
            ? "Este código já está em uso. Escolha outro identificador."
            : "Não foi possível salvar o cartão. Revise os dados e tente novamente."}
        </p>
      ) : null}

      <section className="admin-card-overview" aria-label="Resumo dos cartões">
        <div>
          <p className="admin-kicker">Rede ativa</p>
          <strong>{cards.filter((card) => card.isActive).length}</strong>
          <span>
            {cards.filter((card) => card.isActive).length === 1
              ? "cartão transmitindo"
              : "cartões transmitindo"}
          </span>
        </div>
        <div className="admin-card-overview__signal" aria-hidden="true">
          {cards.slice(0, 6).map((card, index) => (
            <i
              className={card.isActive ? "is-active" : ""}
              key={card.id}
              style={{ "--signal-index": index } as React.CSSProperties}
            />
          ))}
          <span />
        </div>
        <p>
          Cada código identifica de onde veio o acesso, sem armazenar dados
          pessoais do visitante.
        </p>
      </section>

      <section className="admin-cards-grid" aria-label="Cartões cadastrados">
        {cards.map((card) => {
          const cardUrl = `${siteUrl}/t/${profile.slug}?card=${encodeURIComponent(card.code)}`;

          return (
            <article className="admin-card-record" key={card.id}>
              <div className="admin-physical-card">
                <div className="admin-physical-card__top">
                  <span className="admin-physical-card__brand">
                    <Image
                      src="/brand/aera-symbol.png"
                      alt=""
                      width={29}
                      height={29}
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

              <div className="admin-card-record__body">
                <div className="admin-card-record__heading">
                  <div>
                    <p className="admin-kicker">
                      {card.campaign || "Sem campanha"}
                    </p>
                    <h2>{card.label}</h2>
                  </div>
                  <span>{formatCreatedAt(card.createdAt)}</span>
                </div>

                <dl className="admin-card-stats">
                  <div>
                    <dt>Acessos</dt>
                    <dd>{card.views}</dd>
                  </div>
                  <div>
                    <dt>Ações</dt>
                    <dd>{card.actions}</dd>
                  </div>
                  <div>
                    <dt>Local</dt>
                    <dd>{card.location || "—"}</dd>
                  </div>
                </dl>

                <div className="admin-card-url">
                  <span>URL para NFC</span>
                  <code>{cardUrl}</code>
                </div>

                <div className="admin-card-record__actions">
                  <CopyCardUrl url={cardUrl} compact />
                  <a
                    href={`/api/admin/cards/${card.id}/qr?download=1`}
                    className="admin-card-text-action"
                  >
                    Baixar QR
                  </a>
                  <Link
                    href={`/admin/cards/${card.id}`}
                    className="admin-card-text-action"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-new-card" id="novo-cartao">
        <div className="admin-new-card__intro">
          <p className="admin-kicker">Novo ponto de contato</p>
          <h2>Ative um novo sinal.</h2>
          <p>
            Use um código permanente e fácil de reconhecer. Ele será impresso no
            QR e gravado na tag NFC.
          </p>
          <div className="admin-new-card__diagram" aria-hidden="true">
            <span>Cartão</span>
            <i />
            <span>Perfil</span>
            <i />
            <span>Métrica</span>
          </div>
        </div>

        <form className="admin-new-card__form" action="/api/admin/cards" method="post">
          <input type="hidden" name="profileId" value={profile.id} />
          <label className="admin-field admin-field--wide">
            <span>Nome do cartão</span>
            <input
              name="label"
              placeholder="Ex.: Cartão pessoal Tiago"
              maxLength={120}
              required
            />
          </label>
          <label className="admin-field admin-field--wide">
            <span>Código permanente</span>
            <input
              name="code"
              placeholder="aera-tiago-002"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              maxLength={80}
              required
            />
            <small>
              Letras minúsculas, números e hífens. Não poderá ser alterado depois.
            </small>
          </label>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Campanha ou contexto</span>
              <input
                name="campaign"
                placeholder="Networking geral"
                maxLength={120}
              />
            </label>
            <label className="admin-field">
              <span>Local</span>
              <input
                name="location"
                placeholder="Rio de Janeiro"
                maxLength={120}
              />
            </label>
          </div>
          <label className="admin-switch admin-switch--card">
            <input name="isActive" type="checkbox" defaultChecked />
            <span aria-hidden="true" />
            <div>
              <strong>Ativar ao criar</strong>
              <small>O cartão poderá abrir o perfil imediatamente.</small>
            </div>
          </label>
          <button className="admin-button admin-button--primary" type="submit">
            Criar cartão <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
