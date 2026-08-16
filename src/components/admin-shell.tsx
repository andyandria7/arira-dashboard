"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ANALYSE = [
  { href: "/", label: "Vue d'ensemble" },
  { href: "/emotions", label: "Émotions" },
  { href: "/gamification", label: "Gamification" },
  { href: "/community", label: "Communauté" },
];

const NAV_CONTENU = [
  { href: "/prompts", label: "Prompts" },
  { href: "/users", label: "Utilisateurs" },
];

const NAV_MONETISATION = [{ href: "/subscriptions", label: "Abonnements" }];

const PALETTES = ["classic", "indigo", "ocean", "sunset"] as const;

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={`nav-item${active ? " active" : ""}`}>
      <span className="dot" />
      {label}
    </Link>
  );
}

export function AdminShell({
  children,
  who,
}: {
  children: React.ReactNode;
  who: string;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [palette, setPalette] = useState<(typeof PALETTES)[number]>("classic");

  useEffect(() => {
    // Lecture ponctuelle d'un système externe (localStorage) au montage —
    // le script anti-FOUC (theme-init-script) a déjà stampé <html>, ceci ne
    // fait que synchroniser l'état React affiché par les boutons (icône,
    // pastille active).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((localStorage.getItem("arira-admin-theme") as "light" | "dark") || "light");
    setPalette((localStorage.getItem("arira-admin-palette") as typeof palette) || "classic");
  }, []);

  function applyTheme(next: "light" | "dark") {
    setTheme(next);
    localStorage.setItem("arira-admin-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  function applyPalette(next: typeof palette) {
    setPalette(next);
    localStorage.setItem("arira-admin-palette", next);
    if (next === "classic") document.documentElement.removeAttribute("data-palette");
    else document.documentElement.setAttribute("data-palette", next);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = who
    .split(/[.\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "AD";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div className="brand-text">
            <div className="display">Arira</div>
            <div className="sub">Espace admin</div>
          </div>
        </div>

        <nav className="nav-group">
          <div className="nav-label">Analyse</div>
          {NAV_ANALYSE.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Contenu</div>
          {NAV_CONTENU.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Monétisation</div>
          {NAV_MONETISATION.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="appearance">
          <div className="appearance-row">
            <span className="appearance-label">Palette</span>
            <button
              className="theme-toggle"
              type="button"
              title="Basculer le mode sombre"
              onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              )}
            </button>
          </div>
          <div className="palette-swatches">
            {PALETTES.map((p) => (
              <button
                key={p}
                className={`swatch${palette === p ? " is-active" : ""}`}
                data-swatch={p}
                title={p}
                type="button"
                onClick={() => applyPalette(p)}
              />
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="avatar-chip">{initials}</div>
          <div style={{ flex: 1 }}>
            <div className="who">{who}</div>
            <button className="logout-link" type="button" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
