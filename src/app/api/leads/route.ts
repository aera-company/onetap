import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { allowRequest, isSameOrigin } from "@/lib/rate-limit";
import {
  countRecentLeads,
  createLead,
  detectDevice,
  getRuntimeCard,
  getRuntimeProfile,
  hasRecentLeadFrom,
  recordEvent,
} from "@/lib/supabase";

/** Teto de leads por perfil por hora. Acima disso o formulário recusa. */
const HOURLY_LIMIT = 30;
const DEDUPE_WINDOW_HOURS = 24;

/** Teto por IP, complementar ao teto por perfil: 5 envios a cada 10 minutos. */
const IP_LIMIT = 5;
const IP_WINDOW_SECONDS = 600;

const leadSchema = z
  .object({
    slug: z.string().trim().min(1).max(120),
    cardCode: z.string().trim().max(120).optional(),
    name: z.string().trim().min(2).max(120),
    email: z.union([z.literal(""), z.string().trim().email().max(200)]),
    phone: z.string().trim().max(40),
    message: z.string().trim().max(1000),
  })
  .refine((data) => data.email || data.phone, {
    message: "Informe e-mail ou telefone.",
    path: ["email"],
  });

function back(request: NextRequest, slug: string, cardCode: string, state: string) {
  const params = new URLSearchParams();
  if (cardCode) params.set("card", cardCode);
  params.set("lead", state);
  return NextResponse.redirect(
    new URL(`/t/${slug}?${params.toString()}#contato`, request.url),
    303,
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "").trim();
  const cardCode = String(formData.get("cardCode") ?? "").trim();

  if (!isSameOrigin(request)) {
    return back(request, slug, cardCode, "erro");
  }

  // Campo-armadilha: invisível para pessoas, atraente para bots. Preenchido,
  // respondemos como sucesso para não ensinar o bot a contornar.
  if (String(formData.get("website") ?? "").trim()) {
    return back(request, slug, cardCode, "ok");
  }

  const parsed = leadSchema.safeParse({
    slug,
    cardCode: cardCode || undefined,
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return back(request, slug, cardCode, "invalido");
  }

  if (!(await allowRequest(request, "leads", IP_LIMIT, IP_WINDOW_SECONDS))) {
    return back(request, slug, cardCode, "limite");
  }

  try {
    const profile = await getRuntimeProfile(parsed.data.slug, true);
    if (!profile || !profile.isActive || !profile.leadsEnabled) {
      return back(request, slug, cardCode, "indisponivel");
    }

    // Um cartão pausado não abre o perfil; também não deve gerar lead.
    const card = await getRuntimeCard(parsed.data.cardCode);
    if (card && !card.isActive) {
      return back(request, slug, cardCode, "indisponivel");
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if ((await countRecentLeads(profile.id, hourAgo)) >= HOURLY_LIMIT) {
      return back(request, slug, cardCode, "limite");
    }

    const dedupeSince = new Date(
      Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const duplicate = parsed.data.email
      ? await hasRecentLeadFrom(profile.id, parsed.data.email, dedupeSince)
      : false;

    if (!duplicate) {
      const userAgent = request.headers.get("user-agent") ?? "";
      await createLead({
        profileId: profile.id,
        cardCode: card?.code ?? parsed.data.cardCode ?? null,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
        deviceType: detectDevice(userAgent),
        referrer: request.headers.get("referer"),
      });

      after(async () => {
        await recordEvent({
          profileId: profile.id,
          cardCode: card?.code ?? parsed.data.cardCode ?? null,
          eventType: "lead_submit",
          referrer: request.headers.get("referer"),
          userAgent,
        });
      });
    }

    return back(request, slug, cardCode, "ok");
  } catch (error) {
    console.error("[leads] Falha ao registrar lead", error);
    return back(request, slug, cardCode, "erro");
  }
}
