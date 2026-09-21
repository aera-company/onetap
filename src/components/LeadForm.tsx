import type { Profile } from "@/types/profile";

type LeadFormProps = {
  profile: Profile;
  cardCode?: string;
  state?: string;
};

const messages: Record<string, { tone: "ok" | "erro"; text: string }> = {
  ok: {
    tone: "ok",
    text: "Contato enviado. Em breve retorno para você.",
  },
  invalido: {
    tone: "erro",
    text: "Revise os campos: nome e ao menos um e-mail ou telefone.",
  },
  limite: {
    tone: "erro",
    text: "Muitos envios agora há pouco. Tente de novo em alguns minutos.",
  },
  indisponivel: {
    tone: "erro",
    text: "Este perfil não está recebendo contatos no momento.",
  },
  erro: {
    tone: "erro",
    text: "Não foi possível enviar agora. Tente novamente em instantes.",
  },
};

export function LeadForm({ profile, cardCode, state }: LeadFormProps) {
  const feedback = state ? messages[state] : undefined;
  const sent = state === "ok";

  return (
    <section className="lead section-block" id="contato">
      <div className="section-heading">
        <p className="eyebrow">Troca de contato</p>
        <h2>Deixe o seu também.</h2>
      </div>

      <p className="lead__intro">
        Você já tem o meu. Se quiser que eu retome a conversa, é só deixar como
        te encontrar.
      </p>

      {feedback ? (
        <p className={`lead__message lead__message--${feedback.tone}`} role="status">
          {feedback.text}
        </p>
      ) : null}

      {sent ? null : (
        <form className="lead-form" action="/api/leads" method="post">
          <input type="hidden" name="slug" value={profile.slug} />
          {cardCode ? (
            <input type="hidden" name="cardCode" value={cardCode} />
          ) : null}

          {/* Campo-armadilha para bots: fora da tela, fora da ordem de foco e
              escondido de leitores de tela. Ninguém real preenche isto. */}
          <div className="lead-form__trap" aria-hidden="true">
            <label htmlFor="website">Não preencha este campo</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <label className="lead-field">
            <span>Nome</span>
            <input
              name="name"
              autoComplete="name"
              maxLength={120}
              required
              placeholder="Como devo te chamar"
            />
          </label>

          <div className="lead-form__row">
            <label className="lead-field">
              <span>E-mail</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={200}
                placeholder="voce@empresa.com"
              />
            </label>
            <label className="lead-field">
              <span>Telefone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                placeholder="(00) 00000-0000"
              />
            </label>
          </div>
          <p className="lead-form__hint">Informe pelo menos um dos dois.</p>

          <label className="lead-field">
            <span>Mensagem (opcional)</span>
            <textarea
              name="message"
              rows={3}
              maxLength={1000}
              placeholder="Sobre o que você gostaria de conversar?"
            />
          </label>

          <button className="lead-form__submit" type="submit">
            Enviar contato <span aria-hidden="true">↗</span>
          </button>

          <p className="lead-form__legal">
            Seus dados são usados apenas para este retorno. Veja a{" "}
            <a href={`/privacidade?perfil=${encodeURIComponent(profile.slug)}`}>
              política de privacidade
            </a>
            .
          </p>
        </form>
      )}
    </section>
  );
}
