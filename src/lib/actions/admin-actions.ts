"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setSubscriberStatus(userId: string, isSubscriber: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ is_subscriber: isSubscriber }).eq("id", userId);
  if (error) throw error;

  revalidatePath("/subscriptions");
  revalidatePath("/");
}

export async function deleteUserAccount(userId: string) {
  const { user } = await requireAdmin();
  if (user.id === userId) {
    throw new Error("Impossible de supprimer votre propre compte admin depuis ce dashboard.");
  }

  const supabase = createAdminClient();

  // Nettoyage Storage — les objets ne sont pas liés par contrainte FK à
  // auth.users, donc auth.admin.deleteUser() ne les supprime pas tout seul.
  // Convention de chemin : `{userId}/...` (cf. arira/lib/uploadPhotos.ts).
  for (const bucket of ["journal-photos", "avatars"]) {
    const { data: files } = await supabase.storage.from(bucket).list(userId);
    if (files && files.length > 0) {
      await supabase.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
    }
  }

  // Supprime le compte auth — profiles/journal_entries suivent via
  // `on delete cascade` (cf. arira/lib/migrations/002_profiles.sql et 004).
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/users");
  revalidatePath("/");
}
