import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin-shell";

// Garde d'accès pour tout l'espace admin : toute page ajoutée sous
// src/app/(admin)/ hérite automatiquement de cette vérification.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  return <AdminShell who={profile.username ?? user.email ?? "Admin"}>{children}</AdminShell>;
}
