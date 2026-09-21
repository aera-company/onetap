export type ProfileService = {
  title: string;
  detail: string;
};

/** Número de serviços editáveis no painel. */
export const MAX_SERVICES = 4;

export type Profile = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  headline: string;
  bio: string;
  logoUrl: string;
  email: string;
  phone: string;
  website: string;
  instagramUrl: string;
  linkedinUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  presentationUrl: string;
  calendarUrl: string;
  isActive: boolean;
  leadsEnabled: boolean;
  services: ProfileService[];
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cardCode: string;
  deviceType: string;
  utmSource: string;
  createdAt: string;
};

export type Card = {
  id: string;
  profileId: string;
  code: string;
  label: string;
  campaign: string;
  location: string;
  isActive: boolean;
};

export type EventType =
  | "page_view"
  | "presentation_click"
  | "whatsapp_click"
  | "contact_download"
  | "calendar_click"
  | "website_click"
  | "social_click"
  | "lead_submit";
