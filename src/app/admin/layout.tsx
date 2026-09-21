import type { Metadata, Viewport } from "next";
import "@/app/admin/admin.css";

export const metadata: Metadata = {
  title: {
    default: "Painel",
    template: "%s · One Tap",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
  colorScheme: "light",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
