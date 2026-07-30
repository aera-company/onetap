import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Tap",
    short_name: "One Tap",
    description: "Cartões, conexões e métricas em um só toque.",
    id: "/admin",
    start_url: "/admin/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f5f1",
    theme_color: "#151a17",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Visão geral",
        short_name: "Métricas",
        description: "Abrir métricas e sinais recentes.",
        url: "/admin/dashboard",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Cartões",
        short_name: "Cartões",
        description: "Gerenciar cartões NFC e QR Codes.",
        url: "/admin/cards",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Perfil público",
        short_name: "Perfil",
        description: "Editar a experiência pública.",
        url: "/admin/profile",
        icons: [
          {
            src: "/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
