import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest, isSameOrigin } from "@/lib/rate-limit";
import { getRuntimeCard, getRuntimeProfile, recordEvent } from "@/lib/supabase";

/** Uma visita real gera poucos eventos; 60/min por IP é folgado e mata script. */
const LIMIT = 60;
const WINDOW_SECONDS = 60;

// `lead_submit` fica de fora de propósito: é gravado pelo servidor quando um
// lead entra. Aceitá-lo aqui deixaria inflar a métrica sem deixar contato.
const eventSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  cardCode: z.string().trim().max(120).optional(),
  sessionId: z.string().uuid(),
  eventType: z.enum([
    "page_view",
    "presentation_click",
    "whatsapp_click",
    "contact_download",
    "calendar_click",
    "website_click",
    "social_click",
  ]),
  referrer: z.string().max(2048).nullable().optional(),
  path: z.string().max(500),
  utmSource: z.string().max(200).nullable().optional(),
  utmMedium: z.string().max(200).nullable().optional(),
  utmCampaign: z.string().max(200).nullable().optional(),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  if (!(await allowRequest(request, "events", LIMIT, WINDOW_SECONDS))) {
    return NextResponse.json({ accepted: false }, { status: 429 });
  }

  try {
    // O perfil é resolvido no servidor a partir do slug. Antes o cliente
    // mandava o profileId, o que permitia atribuir eventos a qualquer perfil.
    const profile = await getRuntimeProfile(parsed.data.slug);
    if (!profile || !profile.isActive) {
      return NextResponse.json({ accepted: false }, { status: 404 });
    }

    // Um cartão de outro perfil (ou pausado) não atribui origem: o evento entra
    // como acesso direto em vez de creditar o cartão errado.
    const card = await getRuntimeCard(parsed.data.cardCode);
    const cardCode =
      card && card.isActive && card.profileId === profile.id ? card.code : null;

    const result = await recordEvent({
      profileId: profile.id,
      cardCode,
      sessionId: parsed.data.sessionId,
      eventType: parsed.data.eventType,
      referrer: parsed.data.referrer ?? null,
      userAgent: request.headers.get("user-agent"),
      utmSource: parsed.data.utmSource ?? null,
      utmMedium: parsed.data.utmMedium ?? null,
      utmCampaign: parsed.data.utmCampaign ?? null,
    });

    return NextResponse.json({ accepted: true, ...result });
  } catch (error) {
    // Rastreio nunca derruba a navegação: o beacon do cliente ignora a resposta
    // e um banco indisponível não deve virar 500 a cada evento.
    console.error("[analytics] Falha ao resolver o evento", error);
    return NextResponse.json({ accepted: true, persisted: false });
  }
}
