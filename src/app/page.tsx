import { redirect } from "next/navigation";

// Não existe um perfil "principal" — cada tenant é alcançado pela URL do seu
// cartão. Defina NEXT_PUBLIC_DEFAULT_PROFILE_SLUG para que a raiz abra um
// perfil específico; sem isso, a raiz leva ao painel.
export default function Home() {
  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_PROFILE_SLUG?.trim();
  redirect(defaultSlug ? `/t/${defaultSlug}` : "/admin");
}
