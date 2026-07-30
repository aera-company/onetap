import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import {
  createRuntimeCard,
  getRuntimeProfile,
  updateRuntimeCard,
} from "@/lib/supabase";

const cardSchema = z.object({
  profileId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().trim().min(2).max(120),
  campaign: z.string().trim().max(120),
  location: z.string().trim().max(120),
  isActive: z.boolean(),
});

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();
  const action = formData.get("action") === "update" ? "update" : "create";
  const parsed = cardSchema.safeParse({
    profileId: formData.get("profileId"),
    code: formData.get("code"),
    label: formData.get("label"),
    campaign: formData.get("campaign"),
    location: formData.get("location"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    const path =
      action === "update"
        ? `/admin/cards/${String(formData.get("cardId") ?? "")}`
        : "/admin/cards";
    return NextResponse.redirect(new URL(`${path}?error=validation`, request.url), 303);
  }

  try {
    const adminProfile = await getRuntimeProfile("tiago", true);
    if (!adminProfile || adminProfile.id !== parsed.data.profileId) {
      return new Response("Perfil não autorizado.", { status: 403 });
    }

    if (action === "update") {
      const cardId = z.string().uuid().parse(formData.get("cardId"));
      await updateRuntimeCard(cardId, parsed.data);
      revalidatePath("/admin/cards");
      revalidatePath(`/admin/cards/${cardId}`);
      revalidatePath("/t/tiago");
      return NextResponse.redirect(
        new URL(`/admin/cards/${cardId}?saved=1`, request.url),
        303,
      );
    }

    await createRuntimeCard(parsed.data);
    revalidatePath("/admin/cards");
    return NextResponse.redirect(
      new URL("/admin/cards?created=1", request.url),
      303,
    );
  } catch (error) {
    console.error("[admin] Card save failed", error);
    const duplicate =
      error instanceof Error &&
      (error.message.includes("23505") || error.message.includes("duplicate"));
    const path =
      action === "update"
        ? `/admin/cards/${String(formData.get("cardId") ?? "")}?error=save`
        : `/admin/cards?error=${duplicate ? "duplicate" : "save"}`;
    return NextResponse.redirect(new URL(path, request.url), 303);
  }
}
