import { NextRequest, after } from "next/server";
import { createVCard } from "@/lib/vcard";
import { getRuntimeCard, getRuntimeProfile, recordEvent } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const profile = await getRuntimeProfile(slug);

  if (!profile || !profile.isActive) {
    return new Response("Perfil não encontrado.", { status: 404 });
  }

  const cardCode = request.nextUrl.searchParams.get("card") ?? undefined;
  const card = await getRuntimeCard(cardCode);

  // Um cartão pausado não abre o perfil; também não deve entregar o contato.
  if (card && !card.isActive) {
    return new Response("Cartão indisponível.", { status: 404 });
  }

  // O rastreio é feito aqui, e não no clique, porque o download é uma navegação:
  // o beacon do cliente concorre com ela e acessos diretos ao .vcf não passariam
  // pela página. Sem sessão do browser, o evento fica sem session_id.
  after(async () => {
    await recordEvent({
      profileId: profile.id,
      cardCode: card?.code ?? cardCode ?? null,
      eventType: "contact_download",
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    });
  });

  const filename = profile.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return new Response(createVCard(profile), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.vcf"`,
      // Dados pessoais: nunca em cache compartilhado de CDN ou proxy.
      "Cache-Control": "private, no-store",
    },
  });
}
