import type { Profile } from "@/types/profile";
import { getPersonalShowcase } from "@/data/personal-showcase";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { ActionLink } from "@/components/ActionLink";
import { TrackedLink } from "@/components/TrackedLink";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  ContactIcon,
  MessageIcon,
  TapIcon,
} from "@/components/icons";
import { ProfileTracker } from "@/components/ProfileTracker";
import { LeadForm } from "@/components/LeadForm";

type ProfilePageProps = {
  profile: Profile;
  cardCode?: string;
  leadState?: string;
};

export function ProfilePage({ profile, cardCode, leadState }: ProfilePageProps) {
  const showcase = getPersonalShowcase(profile.slug);
  const whatsappUrl = buildWhatsappUrl(
    profile.whatsappNumber,
    showcase?.whatsappMessage ?? profile.whatsappMessage,
  );
  const headline = showcase?.headline ?? profile.headline;
  const bio = showcase?.bio ?? profile.bio;
  const presentationUrl = showcase?.portfolioUrl ?? profile.presentationUrl;
  const contactUrl = `/t/${profile.slug}/contact.vcf${
    cardCode ? `?card=${encodeURIComponent(cardCode)}` : ""
  }`;

  return (
    <main className="profile-shell">
      <ProfileTracker slug={profile.slug} cardCode={cardCode} />
      <div className="field" aria-hidden="true">
        <i />
        <i />
      </div>

      <header className="profile-nav" aria-label="Identificação do produto">
        <a className="wordmark" href="#top" aria-label="One Tap, voltar ao início">
          <span className="aera-mark" aria-hidden="true" />
          <span className="wordmark__product">One Tap</span>
        </a>
        <span className="profile-nav__signal">
          <span />
          Pronto para conectar
        </span>
      </header>

      <section className="hero" id="top">
        <span className="hero__signal" aria-hidden="true" />
        <div className="hero__identity">
          {/* O avatar é editável no painel e pode apontar para qualquer host.
              next/image exigiria remotePatterns e lançaria erro em runtime —
              derrubando a página inteira — para um host não liberado. */}
          <div className={`avatar${profile.logoUrl ? " avatar--brand" : ""}`}>
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={`Símbolo ${profile.company}`}
                width={27}
                height={27}
                decoding="async"
              />
            ) : (
              <span>{profile.initials}</span>
            )}
          </div>
          <p className="eyebrow">{profile.company}</p>
          <h1>{profile.name}</h1>
          <p className="hero__role">{profile.role}</p>
          <p className="hero__headline">{headline}</p>
        </div>

        <div className="tap-origin">
          <span className="tap-origin__mark" aria-hidden="true">
            <TapIcon />
          </span>
          <span>
            <strong>Conectado via One Tap</strong>
            <small>NFC · QR · Link direto</small>
          </span>
        </div>
      </section>

      <section className="actions" aria-label="Ações principais">
        <ActionLink
          href={presentationUrl}
          icon={<ArrowUpRightIcon />}
          label="Ver trabalhos da AERA"
          description="Projetos, visão e capacidades"
          eventType="presentation_click"
          slug={profile.slug}
          cardCode={cardCode}
          primary
          external={presentationUrl.startsWith("http")}
        />
        <div className="actions__secondary">
          <ActionLink
            href={whatsappUrl}
            icon={<MessageIcon />}
            label="Receber pelo WhatsApp"
            description={whatsappUrl ? "Abrir conversa" : "Número a configurar"}
            eventType="whatsapp_click"
            slug={profile.slug}
            cardCode={cardCode}
            external
          />
          <ActionLink
            href={contactUrl}
            icon={<ContactIcon />}
            label="Salvar contato"
            description="Adicionar à agenda"
            eventType={null}
            slug={profile.slug}
            cardCode={cardCode}
          />
          {profile.calendarUrl ? (
            <ActionLink
              href={profile.calendarUrl}
              icon={<CalendarIcon />}
              label="Agendar conversa"
              description="Escolher um horário"
              eventType="calendar_click"
              slug={profile.slug}
              cardCode={cardCode}
              external
            />
          ) : null}
        </div>
      </section>

      {showcase?.projects.length ? (
        <section className="selected-work" aria-labelledby="selected-work-title">
          <div className="selected-work__intro">
            <p>Selected work</p>
            <h2 id="selected-work-title">Things already in motion.</h2>
          </div>
          <div className="selected-work__list">
            {showcase.projects.map((project, index) => (
              <TrackedLink
                className="selected-work__item"
                href={project.url}
                eventType="presentation_click"
                slug={profile.slug}
                cardCode={cardCode}
                external
                key={project.name}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.detail}</small>
                </span>
                <span aria-hidden="true">↗</span>
              </TrackedLink>
            ))}
          </div>
        </section>
      ) : null}

      {showcase?.practice.length ? (
        <section className="practice section-block" aria-labelledby="practice-title">
          <div className="section-heading">
            <p className="eyebrow">Da ideia ao movimento</p>
            <h2 id="practice-title">Think it. Make it. Move it.</h2>
          </div>
          <div className="practice__grid">
            {showcase.practice.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="about section-block" id="sobre">
        <div className="section-heading">
          <p className="eyebrow">Sobre a AERA</p>
          <h2>From first thought to first version running.</h2>
        </div>
        <p className="about__copy">{bio}</p>
      </section>

      {!showcase && profile.services.length ? (
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
                  {service.detail ? <p>{service.detail}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {profile.leadsEnabled ? (
        <LeadForm profile={profile} cardCode={cardCode} state={leadState} />
      ) : null}

      <section className="closing">
        <p className="eyebrow">Have something worth moving?</p>
        <h2>Let&apos;s build it.</h2>
        <div className="closing__actions">
          <a href="#top">Voltar ao início</a>
          <TrackedLink
            href={presentationUrl}
            eventType="presentation_click"
            slug={profile.slug}
            cardCode={cardCode}
            external
          >
            Ver trabalhos
          </TrackedLink>
          {profile.email ? <a href={`mailto:${profile.email}`}>Enviar e-mail</a> : null}
          {profile.website ? (
            <TrackedLink
              href={profile.website}
              eventType="website_click"
              slug={profile.slug}
              cardCode={cardCode}
              external
            >
              Site
            </TrackedLink>
          ) : null}
          {profile.instagramUrl ? (
            <TrackedLink
              href={profile.instagramUrl}
              eventType="social_click"
              slug={profile.slug}
              cardCode={cardCode}
              external
            >
              Instagram
            </TrackedLink>
          ) : null}
          {profile.linkedinUrl ? (
            <TrackedLink
              href={profile.linkedinUrl}
              eventType="social_click"
              slug={profile.slug}
              cardCode={cardCode}
              external
            >
              LinkedIn
            </TrackedLink>
          ) : null}
        </div>
      </section>

      <footer className="profile-footer">
        <span>ONE TAP · {profile.company}</span>
        <a href={`/privacidade?perfil=${encodeURIComponent(profile.slug)}`}>
          Privacidade
        </a>
      </footer>
    </main>
  );
}
