import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { getAdminSession } from "@/lib/admin-auth";
import { getSiteUrl } from "@/lib/site";
import { getAdminCard, getOwnedProfile } from "@/lib/supabase";

type QrRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: QrRouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const [{ id }, profile] = await Promise.all([
    params,
    getOwnedProfile(session.userId),
  ]);

  // getAdminCard filtra por profile_id, então um cartão de outro dono
  // simplesmente não é encontrado.
  const card = profile ? await getAdminCard(id, profile.id) : undefined;
  if (!profile || !card) {
    return new Response("Cartão não encontrado.", { status: 404 });
  }

  const siteUrl = await getSiteUrl();
  const cardUrl = `${siteUrl}/t/${profile.slug}?card=${encodeURIComponent(card.code)}`;
  const svg = await QRCode.toString(cardUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 720,
    color: {
      dark: "#0a0a0a",
      light: "#f1efe8",
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
