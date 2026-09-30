import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StudyProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Study Unlock",
  description: "Turn completed study outputs into immediate rewards.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "Study Unlock", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0a0b0e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja" data-theme="dark" suppressHydrationWarning><body><StudyProvider><AppShell>{children}</AppShell></StudyProvider></body></html>;
}
