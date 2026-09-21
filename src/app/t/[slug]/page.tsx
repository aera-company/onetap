import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/ProfilePage";
import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/site";
import { getRuntimeCard, getRuntimeProfile } from "@/lib/supabase";

type PublicProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ card?: string; lead?: string }>;
};

// Sem generateStaticParams de propósito: os perfis vivem no banco e são criados
// a qualquer momento, e a página depende de searchParams (`card`, `lead`).
// Declarar params estáticos manteria a rota em modo estático, onde ler
// searchParams derruba a renderização com DYNAMIC_SERVER_USAGE.
// A leitura do perfil continua cacheada por 30s dentro de getRuntimeProfile.

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getRuntimeProfile(slug);

  if (!profile) return { title: "Perfil indisponível" };

  return {
    title: `${profile.name} · ${profile.company}`,
    description: profile.headline,
    openGraph: {
      title: `${profile.name} — ${profile.company}`,
      description: profile.headline,
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const [{ slug }, { card: cardCode, lead: leadState }] = await Promise.all([
    params,
    searchParams,
  ]);
  const [profile, card] = await Promise.all([
    getRuntimeProfile(slug),
    getRuntimeCard(cardCode),
  ]);

  if (!profile || !profile.isActive) notFound();

  if (card && !card.isActive) {
    return (
      <main className="state-page">
        <div className="state-page__mark" aria-label="AERA One Tap"><span className="aera-mark" aria-hidden="true" /><span className="wordmark__product">One Tap</span></div>
        <div>
          <p className="eyebrow">Cartão indisponível</p>
          <h1>Este cartão foi desativado.</h1>
          <p>Entre em contato com o responsável para receber um acesso válido.</p>
        </div>
        <Link href="/">
          Conhecer o One Tap <span aria-hidden="true">↗</span>
        </Link>
      </main>
    );
  }

  // O QR leva ao mesmo perfil, pelo mesmo cartão: quem escaneia também vê
  // o contexto dele, e a origem continua creditada ao cartão.
  const shareUrl = `${await getSiteUrl()}/t/${profile.slug}${
    card ? `?card=${encodeURIComponent(card.code)}` : ""
  }`;
  const qrSvg = await QRCode.toString(shareUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#0a0a0a", light: "#f1efe8" },
  });

  return (
    <ProfilePage
      share={{ url: shareUrl, svg: qrSvg }}
      profile={profile}
      cardCode={card?.code ?? cardCode}
      cardContext={card ? { campaign: card.campaign, location: card.location } : undefined}
      leadState={leadState}
    />
  );
}
