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
    portfolioUrl: "https://new-3d-landbase.vercel.app/#work",
    whatsappMessage:
      "Olá, Tiago. Conheci seu trabalho pelo One Tap e gostaria de conversar.",
    projects: [
      {
        name: "GAVEA",
        detail: "Digital product · Operational intelligence",
        url: "https://new-3d-landbase.vercel.app/work/gavea-one",
      },
      {
        name: "Casa Nativa",
        detail: "Brand · Character · Book · Website · System",
        url: "https://new-3d-landbase.vercel.app/work/casa-nativa",
      },
      {
        name: "MERUS",
        detail: "Brand · Film · Landing page",
        url: "https://new-3d-landbase.vercel.app/work/merus",
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
