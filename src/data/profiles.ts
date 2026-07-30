import type { Card, Profile } from "@/types/profile";

export const profiles: Profile[] = [
  {
    id: "58c365e5-5c33-49e3-b5f8-c718aa616559",
    slug: "tiago",
    name: "Tiago Lima",
    initials: "TL",
    role: "CEO",
    company: "AERA",
    headline: "Ainda em teste",
    bio: "AERA é uma empresa especializada em…",
    logoUrl: "/brand/aera-symbol.png",
    email: "eutiagolima30@gmail.com",
    phone: "",
    website: "",
    instagramUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/tiago-lima-b2a56a1a0/",
    whatsappNumber: "+55 21 99683-6857",
    whatsappMessage:
      "Olá, bem vindo ao teste onetap",
    presentationUrl: "https://project-zfz53-five.vercel.app/",
    calendarUrl: "",
    isActive: true,
    services: [
      {
        title: "Estratégia",
        detail: "Clareza para marcas, produtos e novas ideias.",
      },
      {
        title: "Branding",
        detail: "Sistemas visuais que constroem presença.",
      },
      {
        title: "Marketing & Engineering Designer",
        detail: "Criatividade, tecnologia e execução conectadas.",
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
