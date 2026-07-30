import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasAdminSession } from "@/lib/admin-auth";
import {
  type DashboardEvent,
  getDashboardData,
} from "@/lib/supabase";

const eventLabels: Record<DashboardEvent["event_type"], string> = {
  page_view: "Perfil acessado",
  presentation_click: "Apresentação aberta",
  whatsapp_click: "WhatsApp iniciado",
  contact_download: "Contato salvo",
  calendar_click: "Agendamento iniciado",
  website_click: "Site acessado",
  social_click: "Rede social acessada",
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

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function AdminDashboardPage() {
  if (!(await hasAdminSession())) redirect("/admin");

  const data = await getDashboardData();
  const maxDailyViews = Math.max(...data.dailyViews.map((day) => day.count), 1);

  return (
    <AdminShell active="dashboard" profileName={data.profile.name}>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Visão geral · Tempo real</p>
          <h1>Olá, {data.profile.name.split(" ")[0]}.</h1>
          <p>Veja como seus encontros estão virando novas conexões.</p>
        </div>
        <Link
          className="admin-button admin-button--secondary"
          href={`/t/${data.profile.slug}?card=aera-tiago-001`}
          target="_blank"
        >
          Ver perfil público <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="admin-signal-card" aria-labelledby="signal-title">
        <div className="admin-signal-card__summary">
          <div>
            <p className="admin-kicker">Sinal recebido</p>
            <h2 id="signal-title">{data.viewsLast7Days}</h2>
            <p>acessos nos últimos 7 dias</p>
          </div>
          <span className="admin-live-status">
            <i />
            Captura ativa
          </span>
        </div>

        <div className="admin-signal-chart">
          <div className="admin-signal-chart__line" aria-hidden="true" />
          {data.dailyViews.map((day) => (
            <div className="admin-signal-day" key={day.date}>
              <div className="admin-signal-day__track">
                <span
                  style={{
                    height: `${Math.max((day.count / maxDailyViews) * 100, day.count ? 14 : 3)}%`,
                  }}
                  title={`${day.count} acessos`}
                />
              </div>
              <strong>{day.count}</strong>
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-metric-strip" aria-label="Métricas principais">
        <article>
          <p>Total de acessos</p>
          <strong>{data.totalViews}</strong>
          <small>desde o início</small>
        </article>
        <article>
          <p>Últimos 30 dias</p>
          <strong>{data.viewsLast30Days}</strong>
          <small>aberturas do perfil</small>
        </article>
        <article>
          <p>Ações realizadas</p>
          <strong>{data.actionCount}</strong>
          <small>cliques e contatos</small>
        </article>
        <article>
          <p>Conversão</p>
          <strong>{formatPercent(data.overallConversion)}%</strong>
          <small>ações por acesso</small>
        </article>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-kicker">Intenção</p>
              <h2>O que gera conexão</h2>
            </div>
            <span>{data.actionCount} ações</span>
          </div>

          <div className="admin-action-list">
            {data.actionMetrics.map((metric) => (
              <article key={metric.eventType}>
                <div className="admin-action-list__copy">
                  <span className={`admin-event-dot admin-event-dot--${metric.eventType}`} />
                  <div>
                    <strong>{metric.label}</strong>
                    <small>{formatPercent(metric.rate)}% dos acessos</small>
                  </div>
                </div>
                <strong>{metric.count}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-panel--card">
          <div className="admin-panel__header">
            <div>
              <p className="admin-kicker">Origem</p>
              <h2>Cartão em destaque</h2>
            </div>
          </div>
          {data.topCard ? (
            <div className="admin-top-card">
              <div className="admin-top-card__tap" aria-hidden="true">
                <span />
                <i />
              </div>
              <p>{data.topCard.label}</p>
              <strong>{data.topCard.count}</strong>
              <small>
                {data.topCard.count === 1 ? "acesso registrado" : "acessos registrados"}
              </small>
              <code>{data.topCard.code}</code>
            </div>
          ) : (
            <div className="admin-empty-state">
              <strong>O primeiro sinal está a caminho.</strong>
              <p>Os acessos por NFC ou QR Code aparecerão aqui.</p>
            </div>
          )}
        </section>
      </div>

      <section className="admin-panel admin-events-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Atividade</p>
            <h2>Sinais recentes</h2>
          </div>
          <span>Últimos {data.recentEvents.length}</span>
        </div>

        {data.recentEvents.length ? (
          <div className="admin-events-table">
            <div className="admin-events-table__head">
              <span>Ação</span>
              <span>Origem</span>
              <span>Dispositivo</span>
              <span>Quando</span>
            </div>
            {data.recentEvents.map((event) => (
              <article key={event.id}>
                <span className="admin-event-name">
                  <i className={`admin-event-dot admin-event-dot--${event.event_type}`} />
                  {eventLabels[event.event_type]}
                </span>
                <span>{event.card_code || "Acesso direto"}</span>
                <span>{event.device_type || "Não identificado"}</span>
                <time dateTime={event.created_at}>{formatDate(event.created_at)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state admin-empty-state--wide">
            <strong>Nenhum sinal recebido ainda.</strong>
            <p>Abra o perfil público para registrar o primeiro acesso.</p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
