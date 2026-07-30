import { NextRequest } from "next/server";
import { getProfileBySlug } from "@/data/profiles";
import { createVCard } from "@/lib/vcard";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const profile = getProfileBySlug(slug);

  if (!profile || !profile.isActive) {
    return new Response("Perfil não encontrado.", { status: 404 });
  }

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
      "Cache-Control": "public, max-age=300",
    },
  });
}
