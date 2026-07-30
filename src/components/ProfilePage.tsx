import type { Profile } from "@/types/profile";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { ActionLink } from "@/components/ActionLink";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  ContactIcon,
  MessageIcon,
  TapIcon,
} from "@/components/icons";
import { ProfileTracker } from "@/components/ProfileTracker";

type ProfilePageProps = {
  profile: Profile;
  cardCode?: string;
};

export function ProfilePage({ profile, cardCode }: ProfilePageProps) {
  const whatsappUrl = buildWhatsappUrl(
    profile.whatsappNumber,
    profile.whatsappMessage,
  );
  const contactUrl = `/t/${profile.slug}/contact.vcf${
    cardCode ? `?card=${encodeURIComponent(cardCode)}` : ""
  }`;

  return (
    <main className="profile-shell">
      <ProfileTracker profileId={profile.id} cardCode={cardCode} />

      <header className="profile-nav" aria-label="Identificação do produto">
        <a className="wordmark" href="#top" aria-label="One Tap, voltar ao início">
          ONE TAP
        </a>
        <span className="profile-nav__signal">
          <span />
          Pronto para conectar
        </span>
      </header>

      <section className="hero" id="top">
        <div className="tap-field" aria-hidden="true">
          <span className="tap-field__orbit tap-field__orbit--outer" />
          <span className="tap-field__orbit tap-field__orbit--inner" />
          <span className="tap-field__core">
            <TapIcon />
          </span>
          <span className="tap-field__label">Aproxime</span>
        </div>

        <div className="hero__identity">
          <div className="avatar" aria-label={`Iniciais de ${profile.name}`}>
            {profile.initials}
          </div>
          <p className="eyebrow">{profile.company}</p>
          <h1>{profile.name}</h1>
          <p className="hero__role">{profile.role}</p>
          <p className="hero__headline">{profile.headline}</p>
        </div>
      </section>

      <section className="actions" aria-label="Ações principais">
        <ActionLink
          href={profile.presentationUrl}
          icon={<ArrowUpRightIcon />}
          label="Conhecer a AERA"
          description="Visão, trabalho e capacidades"
          eventType="presentation_click"
          profileId={profile.id}
          cardCode={cardCode}
          primary
          external={profile.presentationUrl.startsWith("http")}
        />
        <div className="actions__secondary">
          <ActionLink
            href={whatsappUrl}
            icon={<MessageIcon />}
            label="Receber pelo WhatsApp"
            description={whatsappUrl ? "Abrir conversa" : "Número a configurar"}
            eventType="whatsapp_click"
            profileId={profile.id}
            cardCode={cardCode}
            external
          />
          <ActionLink
            href={contactUrl}
            icon={<ContactIcon />}
            label="Salvar contato"
            description="Adicionar à agenda"
            eventType="contact_download"
            profileId={profile.id}
            cardCode={cardCode}
          />
          <ActionLink
            href={profile.calendarUrl || null}
            icon={<CalendarIcon />}
            label="Agendar conversa"
            description={profile.calendarUrl ? "Escolher um horário" : "Link a configurar"}
            eventType="calendar_click"
            profileId={profile.id}
            cardCode={cardCode}
            external
          />
        </div>
      </section>

      <section className="about section-block" id="sobre">
        <div className="section-heading">
          <p className="eyebrow">Sobre a AERA</p>
          <h2>Da intenção à experiência.</h2>
        </div>
        <p className="about__copy">{profile.bio}</p>
      </section>

      <section className="services section-block" aria-labelledby="services-title">
        <div className="section-heading">
          <p className="eyebrow">Como podemos criar juntos</p>
          <h2 id="services-title">Competências que se conectam.</h2>
        </div>
        <div className="services__list">
          {profile.services.map((service, index) => (
            <article className="service" key={service.title}>
              <span className="service__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing">
        <p className="eyebrow">One tap. Real connection.</p>
        <h2>Uma boa conversa pode começar com um toque.</h2>
        <div className="closing__actions">
          <a href="#top">Voltar ao início</a>
          {profile.email ? <a href={`mailto:${profile.email}`}>Enviar e-mail</a> : null}
        </div>
      </section>

      <footer className="profile-footer">
        <span>ONE TAP · AERA</span>
        <a href="/privacidade">Privacidade</a>
      </footer>
    </main>
  );
}
