import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-auth";
import { updateRuntimeProfile } from "@/lib/supabase";

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || URL.canParse(value), "URL inválida");

const profileSchema = z.object({
  profileId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120),
  company: z.string().trim().max(120),
  headline: z.string().trim().max(160),
  bio: z.string().trim().max(1200),
  avatarUrl: z.string().trim().max(2048),
  presentationUrl: optionalUrl,
  whatsappNumber: z.string().trim().max(40),
  whatsappMessage: z.string().trim().max(500),
  calendarUrl: optionalUrl,
  email: z.union([z.literal(""), z.string().trim().email()]),
  phone: z.string().trim().max(40),
  website: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  isActive: z.boolean(),
});

export async function POST(request: NextRequest) {
  if (!(await hasAdminSession())) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    profileId: formData.get("profileId"),
    name: formData.get("name"),
    role: formData.get("role"),
    company: formData.get("company"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    avatarUrl: formData.get("avatarUrl"),
    presentationUrl: formData.get("presentationUrl"),
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessage: formData.get("whatsappMessage"),
    calendarUrl: formData.get("calendarUrl"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    linkedinUrl: formData.get("linkedinUrl"),
    instagramUrl: formData.get("instagramUrl"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return NextResponse.redirect(
      new URL("/admin/profile?error=validation", request.url),
      303,
    );
  }

  try {
    const profile = await updateRuntimeProfile(
      parsed.data.profileId,
      parsed.data,
    );
    revalidatePath(`/t/${profile.slug}`);
    revalidatePath(`/t/${profile.slug}/contact.vcf`);
    return NextResponse.redirect(
      new URL("/admin/profile?saved=1", request.url),
      303,
    );
  } catch (error) {
    console.error("[admin] Profile update failed", error);
    return NextResponse.redirect(
      new URL("/admin/profile?error=save", request.url),
      303,
    );
  }
}
