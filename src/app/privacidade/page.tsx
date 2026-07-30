import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o One Tap trata dados técnicos e de uso.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <a className="wordmark" href="/">ONE TAP</a>
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
          Esses dados são usados para entender o funcionamento da experiência e
          melhorar o produto. Não comercializamos informações pessoais de visitantes.
        </p>
        <a className="legal-page__back" href="/">Voltar ao perfil</a>
      </article>
    </main>
  );
}
