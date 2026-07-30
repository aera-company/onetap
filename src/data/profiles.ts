import type { Card, Profile } from "@/types/profile";

export const profiles: Profile[] = [
  {
    id: "58c365e5-5c33-49e3-b5f8-c718aa616559",
    slug: "tiago",
    name: "Tiago Lima",
    initials: "TL",
    role: "Founder / Creative Strategist",
    company: "AERA Creative Studio",
    headline: "Estratégia, design e tecnologia para ideias ganharem forma.",
    bio: "A AERA transforma estratégia, criatividade e tecnologia em experiências aplicáveis para marcas e negócios. Atuamos na construção de posicionamento, comunicação, produtos digitais, conteúdo e soluções com inteligência artificial.",
    email: "",
    phone: "",
    website: "",
    instagramUrl: "",
    linkedinUrl: "",
    whatsappNumber: "",
    whatsappMessage:
      "Olá, conheci a AERA pelo One Tap e gostaria de receber a apresentação.",
    presentationUrl: "#sobre",
    calendarUrl: "",
    isActive: true,
    services: [
      {
        title: "Estratégia e posicionamento",
        detail: "Clareza para marcas, produtos e novas ideias.",
      },
      {
        title: "Branding e direção criativa",
        detail: "Sistemas visuais que constroem presença.",
      },
      {
        title: "Sites e produtos digitais",
        detail: "Experiências úteis, rápidas e memoráveis.",
      },
      {
        title: "Conteúdo e audiovisual",
        detail: "Narrativas pensadas para cada meio.",
      },
      {
        title: "Inteligência artificial",
        detail: "Soluções práticas para ampliar capacidade.",
      },
    ],
  },
];

export const cards: Card[] = [
  {
    id: "9d528711-b99c-46d1-8217-64d15df0a6dc",
    profileId: profiles[0].id,
    code: "aera-tiago-001",
    label: "Cartão pessoal Tiago",
    campaign: "Networking geral",
    location: "Rio de Janeiro",
    isActive: true,
  },
  {
    id: "2d955a35-72f4-4f9e-9928-a39b23bf8c07",
    profileId: profiles[0].id,
    code: "aera-tiago-disabled",
    label: "Cartão de teste desativado",
    campaign: "Teste",
    location: "Rio de Janeiro",
    isActive: false,
  },
];

export function getProfileBySlug(slug: string) {
  return profiles.find((profile) => profile.slug === slug);
}

export function getCardByCode(code?: string) {
  if (!code) return undefined;
  return cards.find((card) => card.code === code);
}
