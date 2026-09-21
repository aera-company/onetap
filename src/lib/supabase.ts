import type {
  Card,
  EventType,
  Lead,
  Profile,
  ProfileService,
} from "@/types/profile";
import { MAX_SERVICES } from "@/types/profile";
import { getCardByCode, getProfileBySlug } from "@/data/profiles";

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
  services: unknown;
  owner_id: string | null;
  leads_enabled: boolean;
  is_active: boolean;
};

type SupabaseLeadRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  card_code: string | null;
  device_type: string | null;
  utm_source: string | null;
  created_at: string;
};

type SupabaseAdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

type SupabaseCardRow = {
  id: string;
  profile_id: string;
  card_code: string;
  label: string | null;
  campaign: string | null;
  location: string | null;
  is_active: boolean;
  created_at?: string;
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

export type CardInsight = Card & {
  views: number;
  actions: number;
  createdAt: string;
};

const actionLabels: Partial<Record<EventType, string>> = {
  presentation_click: "Apresentação",
  whatsapp_click: "WhatsApp",
  contact_download: "Contato salvo",
  calendar_click: "Agendamento",
  website_click: "Site",
  social_click: "Rede social",
  lead_submit: "Contato deixado",
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

/** Exportada para teste: o jsonb do banco não tem garantia de formato. */
export function mapServices(value: unknown): ProfileService[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      detail: typeof item.detail === "string" ? item.detail : "",
    }))
    .filter((service) => service.title)
    .slice(0, MAX_SERVICES);
}

function mapProfile(row: SupabaseProfileRow): Profile {
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
    logoUrl: row.avatar_url ?? "",
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
    leadsEnabled: row.leads_enabled ?? true,
    services: mapServices(row.services),
  };
}

function mapLead(row: SupabaseLeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    message: row.message ?? "",
    cardCode: row.card_code ?? "",
    deviceType: row.device_type ?? "",
    utmSource: row.utm_source ?? "",
    createdAt: row.created_at,
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

function isSupabaseNetworkError(error: unknown) {
  if (!(error instanceof TypeError) || error.message !== "fetch failed") {
    return false;
  }

  const cause = (error as TypeError & { cause?: { code?: string } }).cause;
  return ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ETIMEDOUT"].includes(
    cause?.code ?? "",
  );
}

function getOfflineProfile(slug: string) {
  const profile = getProfileBySlug(slug);

  // O formulário depende do banco. No modo de contingência ele precisa sumir,
  // ou a página ofereceria uma ação que não consegue persistir o contato.
  return profile ? { ...profile, leadsEnabled: false } : undefined;
}

// Para o uso pessoal, o cartão público continua disponível durante uma falha
// de DNS/rede do Supabase. Erros HTTP do banco ainda sobem normalmente: assim
// problemas de schema, permissão ou configuração não ficam mascarados.
export async function getRuntimeProfile(slug: string, fresh = false) {
  if (!getSupabaseConfig()) return getProfileBySlug(slug);

  try {
    const rows = await supabaseRequest<SupabaseProfileRow[]>(
      `profiles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 30 } },
    );
    return rows[0] ? mapProfile(rows[0]) : undefined;
  } catch (error) {
    if (!isSupabaseNetworkError(error)) throw error;
    console.warn("[profile] Supabase indisponível; usando perfil local.");
    return getOfflineProfile(slug);
  }
}

export async function getAdminUserByEmail(email: string) {
  const rows = await supabaseRequest<SupabaseAdminUserRow[]>(
    `admin_users?select=id,email,password_hash&email=eq.${encodeURIComponent(
      email.trim().toLowerCase(),
    )}&limit=1`,
  );
  return rows[0];
}

/** Usado só para diferenciar "senha errada" de "nenhum admin cadastrado". */
export async function hasAnyAdminUser() {
  const rows = await supabaseRequest<Array<{ id: string }>>(
    "admin_users?select=id&limit=1",
  );
  return rows.length > 0;
}

/**
 * O perfil que o administrador logado administra. Toda leitura e escrita do
 * painel parte daqui — nenhuma rota deve resolver perfil por slug fixo.
 */
export async function getOwnedProfile(ownerId: string) {
  const rows = await supabaseRequest<SupabaseProfileRow[]>(
    `profiles?select=*&owner_id=eq.${encodeURIComponent(
      ownerId,
    )}&order=created_at.asc&limit=1`,
  );
  return rows[0] ? mapProfile(rows[0]) : undefined;
}

export async function getRuntimeCard(code?: string, fresh = false) {
  if (!code) return undefined;
  if (!getSupabaseConfig()) return getCardByCode(code);

  try {
    const rows = await supabaseRequest<SupabaseCardRow[]>(
      `cards?select=*&card_code=eq.${encodeURIComponent(code)}&limit=1`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 30 } },
    );
    return rows[0] ? mapCard(rows[0]) : undefined;
  } catch (error) {
    if (!isSupabaseNetworkError(error)) throw error;
    console.warn("[card] Supabase indisponível; usando cartão local.");
    return getCardByCode(code);
  }
}

/** Retorno de `public.onetap_dashboard_stats`, contado no Postgres. */
type DashboardStatsRow = {
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  actionCount: number;
  actionCounts: Partial<Record<EventType, number>>;
  dailyViews: Array<{ date: string; count: number }>;
  topCard: { code: string; count: number } | null;
  recentEvents: DashboardEvent[];
};

function callRpc<T>(name: string, args: Record<string, unknown>) {
  return supabaseRequest<T>(`rpc/${name}`, {
    method: "POST",
    body: JSON.stringify(args),
  });
}

// `dateKey` já é uma data-calendário de São Paulo vinda do banco. Formatar em
// UTC evita que o fuso a empurre para o dia anterior.
function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${dateKey}T00:00:00Z`))
    .replace(".", "");
}

export async function getDashboardData(
  ownerId: string,
): Promise<DashboardData | undefined> {
  const profile = await getOwnedProfile(ownerId);
  if (!profile) return undefined;

  const [stats, cardRows] = await Promise.all([
    callRpc<DashboardStatsRow>("onetap_dashboard_stats", {
      p_profile_id: profile.id,
    }),
    supabaseRequest<SupabaseCardRow[]>(
      `cards?select=*&profile_id=eq.${profile.id}&order=created_at.asc`,
    ),
  ]);

  const actionMetrics = Object.entries(actionLabels)
    .map(([eventType, label]) => {
      const count = stats.actionCounts[eventType as EventType] ?? 0;
      return {
        eventType: eventType as EventType,
        label,
        count,
        rate: stats.totalViews ? (count / stats.totalViews) * 100 : 0,
      };
    })
    .filter((metric) => metric.count > 0 || metric.eventType !== "social_click");

  const cards = cardRows.map(mapCard);
  const topCard = stats.topCard
    ? {
        code: stats.topCard.code,
        label:
          cards.find((card) => card.code === stats.topCard!.code)?.label ??
          (stats.topCard.code === "acesso-direto"
            ? "Acesso direto"
            : stats.topCard.code),
        count: stats.topCard.count,
      }
    : null;

  return {
    profile,
    totalViews: stats.totalViews,
    viewsLast7Days: stats.viewsLast7Days,
    viewsLast30Days: stats.viewsLast30Days,
    actionCount: stats.actionCount,
    overallConversion: stats.totalViews
      ? (stats.actionCount / stats.totalViews) * 100
      : 0,
    actionMetrics,
    dailyViews: stats.dailyViews.map((day) => ({
      ...day,
      label: formatDayLabel(day.date),
    })),
    recentEvents: stats.recentEvents,
    topCard,
    cards,
  };
}

export async function getCardManagementData(ownerId: string) {
  const profile = await getOwnedProfile(ownerId);
  if (!profile) return undefined;

  const [cardRows, cardStats] = await Promise.all([
    supabaseRequest<SupabaseCardRow[]>(
      `cards?select=*&profile_id=eq.${profile.id}&order=created_at.asc`,
    ),
    callRpc<Array<{ code: string | null; views: number; actions: number }>>(
      "onetap_card_stats",
      { p_profile_id: profile.id },
    ),
  ]);

  const statsByCode = new Map(
    cardStats
      .filter((stat) => stat.code)
      .map((stat) => [stat.code as string, stat]),
  );

  const cards: CardInsight[] = cardRows.map((row) => {
    const card = mapCard(row);
    const stat = statsByCode.get(card.code);

    return {
      ...card,
      views: stat?.views ?? 0,
      actions: stat?.actions ?? 0,
      createdAt: row.created_at ?? new Date().toISOString(),
    };
  });

  return { profile, cards };
}

export type CardInput = {
  profileId: string;
  code: string;
  label: string;
  campaign: string;
  location: string;
  isActive: boolean;
};

/** Só devolve o cartão se ele pertencer ao perfil informado. */
export async function getAdminCard(cardId: string, profileId: string) {
  const rows = await supabaseRequest<SupabaseCardRow[]>(
    `cards?select=*&id=eq.${encodeURIComponent(
      cardId,
    )}&profile_id=eq.${encodeURIComponent(profileId)}&limit=1`,
  );
  return rows[0] ? mapCard(rows[0]) : undefined;
}

export async function createRuntimeCard(input: CardInput) {
  const rows = await supabaseRequest<SupabaseCardRow[]>("cards", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      profile_id: input.profileId,
      card_code: input.code,
      label: input.label || null,
      campaign: input.campaign || null,
      location: input.location || null,
      is_active: input.isActive,
    }),
  });

  if (!rows[0]) throw new Error("O cartão não foi criado.");
  return mapCard(rows[0]);
}

export async function updateRuntimeCard(cardId: string, input: CardInput) {
  const rows = await supabaseRequest<SupabaseCardRow[]>(
    `cards?id=eq.${encodeURIComponent(cardId)}&profile_id=eq.${encodeURIComponent(input.profileId)}`,
    {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify({
        card_code: input.code,
        label: input.label || null,
        campaign: input.campaign || null,
        location: input.location || null,
        is_active: input.isActive,
      }),
    },
  );

  if (!rows[0]) throw new Error("O cartão não foi atualizado.");
  return mapCard(rows[0]);
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
  services: ProfileService[];
  leadsEnabled: boolean;
  isActive: boolean;
};

export async function updateRuntimeProfile(
  profileId: string,
  ownerId: string,
  input: ProfileUpdate,
) {
  const rows = await supabaseRequest<SupabaseProfileRow[]>(
    `profiles?id=eq.${encodeURIComponent(
      profileId,
    )}&owner_id=eq.${encodeURIComponent(ownerId)}`,
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
        services: input.services,
        leads_enabled: input.leadsEnabled,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  if (!rows[0]) throw new Error("O perfil não foi atualizado.");
  return mapProfile(rows[0]);
}

/**
 * Incrementa e avalia o limite numa única ida ao banco. Em serverless o
 * contador precisa ser compartilhado — memória de instância não serve.
 * Falha aberta: indisponibilidade do banco não pode derrubar o tráfego.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  try {
    return await callRpc<boolean>("onetap_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
  } catch (error) {
    console.error("[rate-limit] Falha ao consultar o limite", error);
    return true;
  }
}

export type LeadInput = {
  profileId: string;
  cardCode?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  deviceType?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export async function createLead(input: LeadInput) {
  await supabaseRequest("leads", {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({
      profile_id: input.profileId,
      card_code: input.cardCode || null,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      message: input.message || null,
      device_type: input.deviceType || null,
      referrer: input.referrer || null,
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
    }),
  });
}

/** Teto por perfil, para limitar abuso do endpoint público. */
export async function countRecentLeads(profileId: string, since: Date) {
  const rows = await supabaseRequest<Array<{ id: string }>>(
    `leads?select=id&profile_id=eq.${encodeURIComponent(
      profileId,
    )}&created_at=gte.${since.toISOString()}&limit=200`,
  );
  return rows.length;
}

/** Evita duplicar o mesmo contato quando a pessoa reenvia o formulário. */
export async function hasRecentLeadFrom(
  profileId: string,
  email: string,
  since: Date,
) {
  const rows = await supabaseRequest<Array<{ id: string }>>(
    `leads?select=id&profile_id=eq.${encodeURIComponent(
      profileId,
    )}&email=eq.${encodeURIComponent(
      email,
    )}&created_at=gte.${since.toISOString()}&limit=1`,
  );
  return rows.length > 0;
}

export async function getLeads(ownerId: string) {
  const profile = await getOwnedProfile(ownerId);
  if (!profile) return undefined;

  const rows = await supabaseRequest<SupabaseLeadRow[]>(
    `leads?select=id,name,email,phone,message,card_code,device_type,utm_source,created_at&profile_id=eq.${profile.id}&order=created_at.desc&limit=200`,
  );

  return { profile, leads: rows.map(mapLead) };
}

export type EventInput = {
  profileId: string;
  eventType: EventType;
  cardCode?: string | null;
  sessionId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type EventResult = {
  persisted: boolean;
  reason?: "not_configured" | "upstream_rejected" | "request_failed";
  upstreamStatus?: number;
};

export function detectDevice(userAgent: string) {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

/** Grava um evento. Nunca lança — o rastreio não pode derrubar a resposta. */
export async function recordEvent(input: EventInput): Promise<EventResult> {
  const config = getSupabaseConfig();
  if (!config) return { persisted: false, reason: "not_configured" };

  const userAgent = input.userAgent ?? "";
  const payload = {
    profile_id: input.profileId,
    card_code: input.cardCode ?? null,
    session_id: input.sessionId ?? null,
    event_type: input.eventType,
    referrer: input.referrer ?? null,
    user_agent: userAgent,
    device_type: detectDevice(userAgent),
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
  };

  try {
    const response = await fetch(`${config.url}/rest/v1/events`, {
      method: "POST",
      headers: getSupabaseHeaders(config.key, "return=minimal"),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[analytics] Supabase insert failed", {
        status: response.status,
        message: (await response.text()).slice(0, 500),
      });
      return {
        persisted: false,
        reason: "upstream_rejected",
        upstreamStatus: response.status,
      };
    }

    return { persisted: true };
  } catch (error) {
    if (isSupabaseNetworkError(error)) {
      console.warn("[analytics] Supabase indisponível; evento não persistido.");
    } else {
      console.error("[analytics] Supabase request failed", error);
    }
    return { persisted: false, reason: "request_failed" };
  }
}
