import { Fragment } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { NoProfileState } from "@/components/admin/NoProfileState";
import { getAdminSession } from "@/lib/admin-auth";
import { getOwnedProfile } from "@/lib/supabase";
import { MAX_SERVICES } from "@/types/profile";

type AdminProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminProfilePage({
  searchParams,
}: AdminProfilePageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const profile = await getOwnedProfile(session.userId);
  if (!profile) return <NoProfileState active="profile" email={session.email} />;

  const { saved, error } = await searchParams;

  return (
    <AdminShell active="profile" profileName={profile.name}>
      <header className="admin-page-header admin-page-header--profile">
        <div>
          <p className="admin-kicker">Perfil público</p>
          <h1>Presença em cada toque.</h1>
          <p>Atualize o que as pessoas encontram ao aproximar o cartão.</p>
        </div>
        <a
          className="admin-button admin-button--secondary"
          href={`/t/${profile.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          Abrir prévia <span aria-hidden="true">↗</span>
        </a>
      </header>

      {saved ? (
        <p className="admin-save-message">
          <span>✓</span>
          Alterações publicadas no perfil.
        </p>
      ) : null}
      {error ? (
        <p className="admin-save-message admin-save-message--error">
          Não foi possível salvar. Revise os campos e tente novamente.
        </p>
      ) : null}

      <form className="admin-profile-form" action="/api/admin/profile" method="post">
        <input type="hidden" name="profileId" value={profile.id} />

        <section className="admin-form-section">
          <div className="admin-form-section__intro">
            <span>01</span>
            <div>
              <h2>Identidade</h2>
              <p>As informações que apresentam você em poucos segundos.</p>
            </div>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Nome</span>
              <input name="name" defaultValue={profile.name} required />
            </label>
            <label className="admin-field">
              <span>Cargo</span>
              <input name="role" defaultValue={profile.role} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>Empresa</span>
              <input name="company" defaultValue={profile.company} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>Frase principal</span>
              <input
                name="headline"
                defaultValue={profile.headline}
                maxLength={160}
              />
              <small>Uma frase curta que cria contexto para a conversa.</small>
            </label>
            <label className="admin-field admin-field--wide">
              <span>Biografia curta</span>
              <textarea name="bio" defaultValue={profile.bio} rows={5} />
            </label>
            <label className="admin-field admin-field--wide">
              <span>URL do símbolo ou foto</span>
              <input name="avatarUrl" defaultValue={profile.logoUrl} />
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__intro">
            <span>02</span>
            <div>
              <h2>Ações principais</h2>
              <p>Os caminhos que transformam interesse em contato.</p>
            </div>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span>Link da apresentação</span>
              <input
                name="presentationUrl"
                type="url"
                defaultValue={profile.presentationUrl}
                placeholder="https://"
              />
            </label>
            <label className="admin-field">
              <span>WhatsApp com DDI</span>
              <input
                name="whatsappNumber"
                defaultValue={profile.whatsappNumber}
                placeholder="+55 21 99999-9999"
              />
            </label>
            <label className="admin-field">
              <span>Link de agendamento</span>
              <input
                name="calendarUrl"
                type="url"
                defaultValue={profile.calendarUrl}
                placeholder="https://"
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span>Mensagem predefinida do WhatsApp</span>
              <textarea
                name="whatsappMessage"
                defaultValue={profile.whatsappMessage}
                rows={3}
              />
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__intro">
            <span>03</span>
            <div>
              <h2>Competências</h2>
              <p>
                Até {MAX_SERVICES} blocos. Deixe o título em branco para remover
                o bloco do perfil público.
              </p>
            </div>
          </div>
          <div className="admin-form-grid">
            {Array.from({ length: MAX_SERVICES }, (_, index) => {
              const service = profile.services[index];

              // Cada serviço ocupa uma linha do grid de 2 colunas do pai.
              return (
                <Fragment key={index}>
                  <label className="admin-field">
                    <span>Título {index + 1}</span>
                    <input
                      name={`serviceTitle${index}`}
                      defaultValue={service?.title ?? ""}
                      maxLength={80}
                      placeholder="Ex.: Estratégia"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Descrição {index + 1}</span>
                    <input
                      name={`serviceDetail${index}`}
                      defaultValue={service?.detail ?? ""}
                      maxLength={160}
                      placeholder="Uma linha sobre a competência"
                    />
                  </label>
                </Fragment>
              );
            })}
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__intro">
            <span>04</span>
            <div>
              <h2>Contato e presença</h2>
              <p>Dados usados no contato salvo e nos links complementares.</p>
            </div>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>E-mail</span>
              <input name="email" type="email" defaultValue={profile.email} />
            </label>
            <label className="admin-field">
              <span>Telefone</span>
              <input name="phone" defaultValue={profile.phone} />
            </label>
            <label className="admin-field">
              <span>Site</span>
              <input
                name="website"
                type="url"
                defaultValue={profile.website}
                placeholder="https://"
              />
            </label>
            <label className="admin-field">
              <span>Instagram</span>
              <input
                name="instagramUrl"
                type="url"
                defaultValue={profile.instagramUrl}
                placeholder="https://instagram.com/"
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span>LinkedIn</span>
              <input
                name="linkedinUrl"
                type="url"
                defaultValue={profile.linkedinUrl}
                placeholder="https://linkedin.com/in/"
              />
            </label>
          </div>
        </section>

        <section className="admin-form-section admin-form-section--status">
          <div className="admin-form-section__intro">
            <span>05</span>
            <div>
              <h2>Publicação</h2>
              <p>Controle se o perfil pode ser acessado pelo cartão.</p>
            </div>
          </div>
          <label className="admin-switch">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={profile.isActive}
            />
            <span aria-hidden="true" />
            <div>
              <strong>Perfil ativo</strong>
              <small>Disponível para NFC, QR Code e link direto.</small>
            </div>
          </label>

          <label className="admin-switch">
            <input
              name="leadsEnabled"
              type="checkbox"
              defaultChecked={profile.leadsEnabled}
            />
            <span aria-hidden="true" />
            <div>
              <strong>Receber contatos</strong>
              <small>
                Mostra o formulário de troca de contato no perfil público.
              </small>
            </div>
          </label>
        </section>

        <footer className="admin-form-footer">
          <p>
            As alterações entram no ar imediatamente após salvar.
          </p>
          <button className="admin-button admin-button--primary" type="submit">
            Salvar alterações <span aria-hidden="true">↗</span>
          </button>
        </footer>
      </form>
    </AdminShell>
  );
}
