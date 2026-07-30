import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasAdminSession } from "@/lib/admin-auth";
import { getRuntimeProfile } from "@/lib/supabase";

type AdminProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminProfilePage({
  searchParams,
}: AdminProfilePageProps) {
  if (!(await hasAdminSession())) redirect("/admin");

  const profile = await getRuntimeProfile("tiago", true);
  if (!profile) throw new Error("Perfil não encontrado.");
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
          href={`/t/${profile.slug}?card=aera-tiago-001`}
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
            <span>04</span>
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
