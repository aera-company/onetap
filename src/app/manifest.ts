import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "One Tap",
    short_name: "One Tap",
    description: "Um encontro. Um toque. Uma conexão.",
    start_url: "/t/tiago",
    display: "standalone",
    background_color: "#eef0ec",
    theme_color: "#eef0ec",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
