import type { Metadata } from "next";
import { ThemeInitScript } from "@/components/theme-init-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arira — Dashboard admin",
  description: "Espace d'analyse réservé aux administrateurs Arira",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
