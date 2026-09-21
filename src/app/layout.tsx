import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono, Instrument_Sans } from "next/font/google";
import { PwaRegistration } from "@/components/PwaRegistration";
import "@/app/globals.css";

// As mesmas famílias da landing da AERA (aera.company): Instrument Sans
// semi-condensada nos títulos, Archivo nos rótulos, Geist Mono nos índices.
// next/font serve os arquivos do próprio domínio, então a CSP (font-src 'self')
// não muda.
const display = Instrument_Sans({
  variable: "--font-aera-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const sans = Archivo({
  variable: "--font-aera-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

const mono = Geist_Mono({
  variable: "--font-aera-mono",
  subsets: ["latin"],
  weight: ["400"],
});

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
  icons: {
    icon: [
      {
        url: "/icons/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/icons/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
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
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
