export type PersonalShowcase = {
  headline: string;
  bio: string;
  portfolioUrl: string;
  whatsappMessage: string;
  projects: Array<{
    name: string;
    detail: string;
    url: string;
  }>;
  practice: Array<{
    title: string;
    detail: string;
  }>;
};

const showcases: Record<string, PersonalShowcase> = {
  tiago: {
    headline:
      "Strategy, creative, technology and AI. From first thought to first version running.",
    bio: "Na AERA, conecto estratégia, criatividade e tecnologia para transformar ideias em marcas, produtos e sistemas prontos para ganhar movimento.",
    portfolioUrl: "https://aera.company/#work",
    whatsappMessage:
      "Olá, Tiago. Conheci seu trabalho pelo One Tap e gostaria de conversar.",
    // A mesma seleção e ordem do site (aera.company, Selected Work 01–04).
    projects: [
      {
        name: "MERUS",
        detail: "Brand · Film · Landing page",
        url: "https://aera.company/work/merus",
      },
      {
        name: "Casa Nativa",
        detail: "Brand · Character · Book · Website · System",
        url: "https://aera.company/work/casa-nativa",
      },
      {
        name: "APACHE",
        detail: "Concept · Masterplan · Narrative",
        url: "https://aera.company/work/apache",
      },
      {
        name: "FARMARCAS",
        detail: "Expansion proposal · Method · Campaign",
        url: "https://aera.company/work/farmarcas",
      },
    ],
    practice: [
      {
        title: "Think",
        detail: "Strategy, positioning, product and opportunity.",
      },
      {
        title: "Create",
        detail: "Brand, art direction, film, content and experience.",
      },
      {
        title: "Build",
        detail: "Web, digital products, automation and AI systems.",
      },
      {
        title: "Operate",
        detail: "Launch, test, manage and evolve.",
      },
    ],
  },
};

export function getPersonalShowcase(slug: string) {
  return showcases[slug];
}
