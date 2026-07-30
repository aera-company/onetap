import type { Card, EventType, Profile } from "@/types/profile";
import {
  getCardByCode,
  getProfileBySlug,
  profiles,
} from "@/data/profiles";

type SupabaseProfileRow = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  company: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  presentation_url: string | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  calendar_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  is_active: boolean;
};

type SupabaseCardRow = {
  id: string;
  profile_id: string;
  card_code: string;
  label: string | null;
  campaign: string | null;
  location: string | null;
  is_active: boolean;
};

export type DashboardEvent = {
  id: number;
  event_type: EventType;
  card_code: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

export type DashboardMetric = {
  eventType: EventType;
  label: string;
  count: number;
  rate: number;
};

export type DashboardData = {
  profile: Profile;
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  actionCount: number;
  overallConversion: number;
  actionMetrics: DashboardMetric[];
  dailyViews: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  recentEvents: DashboardEvent[];
  topCard: {
    code: string;
    label: string;
    count: number;
  } | null;
  cards: Card[];
};

const actionLabels: Partial<Record<EventType, string>> = {
  presentation_click: "Apresentação",
  whatsapp_click: "WhatsApp",
  contact_download: "Contato salvo",
  calendar_click: "Agendamento",
  website_click: "Site",
  social_click: "Rede social",
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

function getSupabaseHeaders(key: string, prefer?: string) {
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };

  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function supabaseRequest<T>(
  path: string,
  init?: RequestInit & { prefer?: string },
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase não configurado.");
  const { prefer, ...requestInit } = init ?? {};

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...requestInit,
    headers: {
      ...getSupabaseHeaders(config.key, prefer),
      ...init?.headers,
    },
    cache: init?.cache ?? (init?.next ? undefined : "no-store"),
  });

  if (!response.ok) {
    const message = (await response.text()).slice(0, 500);
    throw new Error(`Supabase respondeu ${response.status}: ${message}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function mapProfile(row: SupabaseProfileRow): Profile {
  const fallback = getProfileBySlug(row.slug) ?? profiles[0];
  const initials = row.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials,
    role: row.role ?? "",
    company: row.company ?? "",
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    logoUrl: row.avatar_url || fallback.logoUrl,
    email: row.email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? "",
    instagramUrl: row.instagram_url ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    whatsappNumber: row.whatsapp_number ?? "",
    whatsappMessage: row.whatsapp_message ?? "",
    presentationUrl: row.presentation_url ?? "",
    calendarUrl: row.calendar_url ?? "",
    isActive: row.is_active,
    services: fallback.services,
  };
}

function mapCard(row: SupabaseCardRow): Card {
  return {
    id: row.id,
    profileId: row.profile_id,
    code: row.card_code,
    label: row.label ?? row.card_code,
    campaign: row.campaign ?? "",
    location: row.location ?? "",
    isActive: row.is_active,
  };
}

export async function getRuntimeProfile(slug: string, fresh = false) {
  try {
    const rows = await supabaseRequest<SupabaseProfileRow[]>(
      `profiles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 30 } },
    );
    return rows[0] ? mapProfile(rows[0]) : undefined;
  } catch (error) {
    console.error("[profile] Falling back to local data", error);
    return getProfileBySlug(slug);
  }
}

export async function getRuntimeCard(code?: string, fresh = false) {
  if (!code) return undefined;

  try {
    const rows = await supabaseRequest<SupabaseCardRow[]>(
      `cards?select=*&card_code=eq.${encodeURIComponent(code)}&limit=1`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 30 } },
    );
    return rows[0] ? mapCard(rows[0]) : undefined;
  } catch (error) {
    console.error("[card] Falling back to local data", error);
    return getCardByCode(code);
  }
}

function buildDailyViews(events: DashboardEvent[]) {
  const timeZone = "America/Sao_Paulo";
  const labelFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone,
  });
  const keyFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const dateKey = keyFormatter.format(date);

    return {
      date: dateKey,
      label: labelFormatter.format(date).replace(".", ""),
      count: events.filter(
        (event) =>
          event.event_type === "page_view" &&
          keyFormatter.format(new Date(event.created_at)) === dateKey,
      ).length,
    };
  });
}

export async function getDashboardData(
  slug = "tiago",
): Promise<DashboardData> {
  const profile = await getRuntimeProfile(slug, true);
  if (!profile) throw new Error("Perfil administrativo não encontrado.");

  const [events, cardRows] = await Promise.all([
    supabaseRequest<DashboardEvent[]>(
      `events?select=id,event_type,card_code,device_type,utm_source,utm_medium,utm_campaign,created_at&profile_id=eq.${profile.id}&order=created_at.desc&limit=2000`,
    ),
    supabaseRequest<SupabaseCardRow[]>(
      `cards?select=*&profile_id=eq.${profile.id}&order=created_at.asc`,
    ),
  ]);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const views = events.filter((event) => event.event_type === "page_view");
  const actions = events.filter((event) => event.event_type !== "page_view");
  const actionMetrics = Object.entries(actionLabels)
    .map(([eventType, label]) => {
      const count = events.filter(
        (event) => event.event_type === eventType,
      ).length;
      return {
        eventType: eventType as EventType,
        label,
        count,
        rate: views.length ? (count / views.length) * 100 : 0,
      };
    })
    .filter((metric) => metric.count > 0 || metric.eventType !== "social_click");

  const viewsByCard = views.reduce<Record<string, number>>((accumulator, event) => {
    const code = event.card_code || "acesso-direto";
    accumulator[code] = (accumulator[code] ?? 0) + 1;
    return accumulator;
  }, {});
  const topCardEntry = Object.entries(viewsByCard).sort((a, b) => b[1] - a[1])[0];
  const cards = cardRows.map(mapCard);
  const topCard = topCardEntry
    ? {
        code: topCardEntry[0],
        label:
          cards.find((card) => card.code === topCardEntry[0])?.label ??
          (topCardEntry[0] === "acesso-direto"
            ? "Acesso direto"
            : topCardEntry[0]),
        count: topCardEntry[1],
      }
    : null;

  return {
    profile,
    totalViews: views.length,
    viewsLast7Days: views.filter(
      (event) => new Date(event.created_at) >= sevenDaysAgo,
    ).length,
    viewsLast30Days: views.filter(
      (event) => new Date(event.created_at) >= thirtyDaysAgo,
    ).length,
    actionCount: actions.length,
    overallConversion: views.length ? (actions.length / views.length) * 100 : 0,
    actionMetrics,
    dailyViews: buildDailyViews(events),
    recentEvents: events.slice(0, 12),
    topCard,
    cards,
  };
}

export type ProfileUpdate = {
  name: string;
  role: string;
  company: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  presentationUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  calendarUrl: string;
  email: string;
  phone: string;
  website: string;
  linkedinUrl: string;
  instagramUrl: string;
  isActive: boolean;
};

export async function updateRuntimeProfile(
  profileId: string,
  input: ProfileUpdate,
) {
  const rows = await supabaseRequest<SupabaseProfileRow[]>(
    `profiles?id=eq.${encodeURIComponent(profileId)}`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify({
        name: input.name,
        role: input.role || null,
        company: input.company || null,
        headline: input.headline || null,
        bio: input.bio || null,
        avatar_url: input.avatarUrl || null,
        presentation_url: input.presentationUrl || null,
        whatsapp_number: input.whatsappNumber || null,
        whatsapp_message: input.whatsappMessage || null,
        calendar_url: input.calendarUrl || null,
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        linkedin_url: input.linkedinUrl || null,
        instagram_url: input.instagramUrl || null,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (!rows[0]) throw new Error("O perfil não foi atualizado.");
  return mapProfile(rows[0]);
}
