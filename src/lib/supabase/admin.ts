import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client "service_role" — bypasse le RLS, voit toutes les données de
// tous les utilisateurs. À utiliser UNIQUEMENT après avoir vérifié
// via requireAdmin() (lib/auth/require-admin.ts) que l'appelant est admin.
// Le "server-only" ci-dessus fait planter le build si ce fichier est
// importé depuis du code client.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
