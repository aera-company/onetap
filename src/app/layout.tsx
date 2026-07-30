import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "One Tap",
    template: "%s · One Tap",
  },
  description:
    "Um toque transforma um encontro em conexão. Conheça, converse e salve o contato.",
  applicationName: "One Tap",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "One Tap",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "One Tap",
    description: "Um encontro. Um toque. Uma conexão.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eef0ec",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
