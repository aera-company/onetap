import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventSchema = z.object({
  profileId: z.string().uuid(),
  cardCode: z.string().max(120).optional(),
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

function detectDevice(userAgent: string) {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export async function POST(request: NextRequest) {
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ accepted: true, persisted: false });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for");
  const payload = {
    profile_id: parsed.data.profileId,
    card_code: parsed.data.cardCode ?? null,
    session_id: parsed.data.sessionId,
    event_type: parsed.data.eventType,
    referrer: parsed.data.referrer ?? null,
    user_agent: userAgent,
    device_type: detectDevice(userAgent),
    utm_source: parsed.data.utmSource ?? null,
    utm_medium: parsed.data.utmMedium ?? null,
    utm_campaign: parsed.data.utmCampaign ?? null,
    ip_hash_source: forwardedFor ? "available_at_edge" : null,
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/events`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return NextResponse.json({ accepted: true, persisted: false });
  }

  return NextResponse.json({ accepted: true, persisted: true });
}
