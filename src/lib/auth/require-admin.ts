import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// À appeler en tête de chaque page/route admin. Redirige vers /login si
// pas connecté, ou vers /unauthorized si connecté mais pas admin.
// Ne renvoie jamais un utilisateur non-admin.
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) {
    redirect("/unauthorized");
  }

  return { user, profile };
}
