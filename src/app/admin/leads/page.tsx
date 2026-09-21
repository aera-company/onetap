import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NoProfileState } from "@/components/admin/NoProfileState";
import { getAdminSession } from "@/lib/admin-auth";
import { getLeads } from "@/lib/supabase";

export const metadata = {
  title: "Contatos",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  })
    .format(new Date(value))
    .replace(".", "");
}

export default async function AdminLeadsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const data = await getLeads(session.userId);
  if (!data) return <NoProfileState active="leads" email={session.email} />;

  const { profile, leads } = data;

  return (
    <AdminShell active="leads" profileName={profile.name}>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Contatos recebidos</p>
          <h1>Quem quis continuar a conversa.</h1>
          <p>
            Pessoas que deixaram o contato pelo formulário do perfil público.
          </p>
        </div>
        <Link
          className="admin-button admin-button--secondary"
          href="/admin/profile"
        >
          Configurar formulário <span aria-hidden="true">↗</span>
        </Link>
      </header>

      {!profile.leadsEnabled ? (
        <p className="admin-save-message admin-save-message--error">
          O formulário está desligado no perfil público. Novos contatos não
          serão recebidos até você reativá-lo em Perfil público.
        </p>
      ) : null}

      <section className="admin-metric-strip" aria-label="Resumo dos contatos">
        <article>
          <p>Total recebido</p>
          <strong>{leads.length}</strong>
          <small>{leads.length === 200 ? "exibindo os 200 mais recentes" : "desde o início"}</small>
        </article>
        <article>
          <p>Com e-mail</p>
          <strong>{leads.filter((lead) => lead.email).length}</strong>
          <small>retorno por e-mail</small>
        </article>
        <article>
          <p>Com telefone</p>
          <strong>{leads.filter((lead) => lead.phone).length}</strong>
          <small>retorno por telefone</small>
        </article>
        <article>
          <p>Com mensagem</p>
          <strong>{leads.filter((lead) => lead.message).length}</strong>
          <small>trouxeram contexto</small>
        </article>
      </section>

      <section className="admin-panel admin-events-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Lista</p>
            <h2>Contatos</h2>
          </div>
          <span>{leads.length}</span>
        </div>

        {leads.length ? (
          <div className="admin-leads-list">
            {leads.map((lead) => (
              <article key={lead.id}>
                <div className="admin-lead__head">
                  <strong>{lead.name}</strong>
                  <time dateTime={lead.createdAt}>
                    {formatDate(lead.createdAt)}
                  </time>
                </div>

                <div className="admin-lead__contacts">
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  ) : null}
                  {lead.phone ? (
                    <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
                      {lead.phone}
                    </a>
                  ) : null}
                </div>

                {lead.message ? <p>{lead.message}</p> : null}

                <div className="admin-lead__meta">
                  <span>{lead.cardCode || "Acesso direto"}</span>
                  {lead.deviceType ? <span>{lead.deviceType}</span> : null}
                  {lead.utmSource ? <span>{lead.utmSource}</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state admin-empty-state--wide">
            <strong>Nenhum contato recebido ainda.</strong>
            <p>
              Quem abrir o perfil pelo cartão poderá deixar nome, e-mail ou
              telefone no formulário.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
