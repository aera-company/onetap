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
  services: Array<{
    title: string;
    detail: string;
  }>;
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
  | "social_click";
