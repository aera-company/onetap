import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminCard, getRuntimeProfile } from "@/lib/supabase";

type QrRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: QrRouteContext) {
  if (!(await hasAdminSession())) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const [card, profile] = await Promise.all([
    getAdminCard(id),
    getRuntimeProfile("tiago", true),
  ]);

  if (!card || !profile || card.profileId !== profile.id) {
    return new Response("Cartão não encontrado.", { status: 404 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    request.nextUrl.origin;
  const cardUrl = `${siteUrl}/t/${profile.slug}?card=${encodeURIComponent(card.code)}`;
  const svg = await QRCode.toString(cardUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 720,
    color: {
      dark: "#171c19",
      light: "#fcfdf9",
    },
  });
  const download = request.nextUrl.searchParams.get("download") === "1";

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, max-age=300",
      ...(download
        ? {
            "Content-Disposition": `attachment; filename="${card.code}-qr.svg"`,
          }
        : {}),
    },
  });
}
