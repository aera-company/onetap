import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o One Tap trata dados técnicos e de uso.",
};

type PrivacyPageProps = {
  searchParams: Promise<{ perfil?: string }>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  // O rodapé do perfil manda de onde o visitante veio, para o link de volta não
  // cair no painel.
  const { perfil } = await searchParams;
  const backHref = perfil && slugPattern.test(perfil) ? `/t/${perfil}` : "/";

  return (
    <main className="legal-page">
      <a className="wordmark" href={backHref}>ONE TAP</a>
      <article>
        <p className="eyebrow">Privacidade</p>
        <h1>Dados mínimos. Uso transparente.</h1>
        <p>
          O One Tap registra apenas informações técnicas e comportamentais básicas,
          como abertura da página, ações realizadas, tipo de dispositivo, origem do
          acesso e parâmetros de campanha.
        </p>
        <p>
          Não capturamos seu número de telefone ao abrir a página. Uma conversa no
          WhatsApp só começa quando você escolhe essa ação e envia a mensagem.
        </p>
        <p>
          Se você preencher o formulário de troca de contato, o nome e o e-mail ou
          telefone informados ficam disponíveis apenas para a pessoa dona deste
          perfil, para que ela retorne o contato. Esses campos são opcionais: a
          página funciona inteira sem eles.
        </p>
        <p>
          Para conter abuso dos formulários, guardamos por um curto período um
          código derivado do seu endereço IP — não o endereço em si, e ele não é
          associado ao seu acesso nem ao seu contato.
        </p>
        <p>
          Esses dados são usados para entender o funcionamento da experiência e
          melhorar o produto. Não comercializamos informações pessoais de visitantes.
        </p>
        <a className="legal-page__back" href={backHref}>
          Voltar ao perfil
        </a>
      </article>
    </main>
  );
}
