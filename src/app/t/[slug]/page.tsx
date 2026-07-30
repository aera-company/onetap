import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/ProfilePage";
import { profiles } from "@/data/profiles";
import { getRuntimeCard, getRuntimeProfile } from "@/lib/supabase";

type PublicProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ card?: string }>;
};

export function generateStaticParams() {
  return profiles.map((profile) => ({ slug: profile.slug }));
}

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
  const [{ slug }, { card: cardCode }] = await Promise.all([params, searchParams]);
  const [profile, card] = await Promise.all([
    getRuntimeProfile(slug),
    getRuntimeCard(cardCode),
  ]);

  if (!profile || !profile.isActive) notFound();

  if (card && !card.isActive) {
    return (
      <main className="state-page">
        <div className="state-page__mark">ONE TAP</div>
        <div>
          <p className="eyebrow">Cartão indisponível</p>
          <h1>Este cartão foi desativado.</h1>
          <p>Entre em contato com o responsável para receber um acesso válido.</p>
        </div>
        <a href="/">Conhecer o One Tap <span aria-hidden="true">↗</span></a>
      </main>
    );
  }

  return <ProfilePage profile={profile} cardCode={card?.code ?? cardCode} />;
}
