import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BADGE_DEFS,
  EMOTIONS_CATALOG,
  LIEUX_CATALOG,
  PERSONNES_CATALOG,
  TAGS_CATALOG,
  getEmotionColor,
} from "@/lib/domain/catalog";
import {
  computeBadgeProgress,
  computeStreak,
  groupBy,
  isBadgeUnlocked,
  isPositiveEmotion,
  type RawEntry,
} from "@/lib/domain/compute";

export interface ProfileRow {
  id: string;
  username: string | null;
  is_admin: boolean;
  is_subscriber: boolean;
  created_at: string;
  email: string | null;
}

interface PromptHistoryRow {
  prompt_id: string;
  status: "sent" | "answered" | "skipped" | null;
  prompts: { content: string } | { content: string }[] | null;
}

const PAGE_SIZE = 1000;

// Le volume de données reste modeste pour l'instant (cf. mémoire du projet :
// pas de vues SQL dédiées) — cette pagination simple suffit tant qu'on reste
// sous quelques dizaines de milliers de lignes. À revoir avec des vues/RPC
// si ça devient un goulot d'étranglement.
async function fetchAllEntries(): Promise<RawEntry[]> {
  const supabase = createAdminClient();
  const rows: RawEntry[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, user_id, emotions, tags, personnes, lieu, photo_uris, created_at")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...(data as RawEntry[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function fetchAllProfiles(): Promise<ProfileRow[]> {
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, is_admin, is_subscriber");
  if (error) throw error;

  // profiles n'a pas de created_at (seulement updated_at, cf. arira/lib/
  // migrations/002_profiles.sql) — la date d'inscription vient d'auth.users.
  // L'email aussi vit sur auth.users, pas profiles.
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) throw authError;

  const authById = new Map(authUsers.users.map((u) => [u.id, u]));

  return (profiles ?? []).map((p) => {
    const authUser = authById.get(p.id);
    return {
      ...p,
      email: authUser?.email ?? null,
      created_at: authUser?.created_at ?? new Date(0).toISOString(),
    };
  });
}

async function fetchPromptHistory(): Promise<PromptHistoryRow[]> {
  const supabase = createAdminClient();
  const rows: PromptHistoryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("user_prompt_history")
      .select("prompt_id, status, prompts(content)")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...(data as unknown as PromptHistoryRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

async function fetchActivePromptsCatalog(): Promise<{ id: string; content: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("prompts").select("id, content").eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}

export const getDashboardSnapshot = cache(async () => {
  const [entries, profiles, promptHistory, promptsCatalog] = await Promise.all([
    fetchAllEntries(),
    fetchAllProfiles(),
    fetchPromptHistory(),
    fetchActivePromptsCatalog(),
  ]);
  return buildSnapshot(entries, profiles, promptHistory, promptsCatalog);
});

function buildSnapshot(
  entries: RawEntry[],
  profiles: ProfileRow[],
  promptHistory: PromptHistoryRow[],
  promptsCatalog: { id: string; content: string }[],
) {
  const now = Date.now();
  const cutoff30 = now - 30 * 86400000;
  const entries30 = entries.filter((e) => new Date(e.created_at).getTime() >= cutoff30);

  const entriesByUser = groupBy(entries, (e) => e.user_id);

  // ─── Vue d'ensemble ─────────────────────────────────────────────────────
  const activeUserIds = new Set(entries30.map((e) => e.user_id));

  let positiveCount = 0;
  let totalEmotions = 0;
  for (const e of entries30) {
    for (const em of e.emotions ?? []) {
      totalEmotions++;
      if (isPositiveEmotion(em.label)) positiveCount++;
    }
  }
  const positiveRatio = totalEmotions > 0 ? Math.round((positiveCount / totalEmotions) * 100) : 0;

  const streaksByUser = new Map<string, number>();
  for (const [userId, userEntries] of entriesByUser) {
    const dates = userEntries.map((e) => new Date(e.created_at));
    streaksByUser.set(userId, computeStreak(dates));
  }
  const streakValues = [...streaksByUser.values()];
  const avgStreak =
    streakValues.length > 0 ? streakValues.reduce((a, b) => a + b, 0) / streakValues.length : 0;

  // Rythme d'écriture — 30 derniers jours, un point par jour.
  const dayBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * 86400000).toISOString().slice(0, 10);
    dayBuckets.set(day, 0);
  }
  for (const e of entries30) {
    const day = e.created_at.slice(0, 10);
    if (dayBuckets.has(day)) dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);
  }
  const rhythm = [...dayBuckets.entries()].map(([day, count]) => ({ day, count }));

  // ─── Émotions ───────────────────────────────────────────────────────────
  const emotionCounts = new Map<string, number>();
  for (const e of entries30) {
    for (const em of e.emotions ?? []) {
      const key = em.label;
      emotionCounts.set(key, (emotionCounts.get(key) ?? 0) + 1);
    }
  }
  const emotionDistribution = [...emotionCounts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      pct: totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0,
      color: getEmotionColor(label),
    }))
    .sort((a, b) => b.count - a.count);

  // Émotions personnalisées (hors catalogue fixe des 12 émotions) — le label
  // suffit à trancher, pas besoin de recouper avec la table custom_emotions
  // qui ne liste que les créations, pas leur fréquence d'usage réelle.
  const fixedEmotionLabels = new Set(EMOTIONS_CATALOG.map((e) => e.label.toLowerCase()));
  const customEmotionsTop = emotionDistribution
    .filter((e) => !fixedEmotionLabels.has(e.label.toLowerCase()))
    .slice(0, 6);

  // Corrélations émotion × contexte social : pour chaque personne taguée,
  // part des entrées (avec cette personne) qui contiennent aussi l'émotion.
  const topEmotionsForHeatmap = emotionDistribution.filter((e) => fixedEmotionLabels.has(e.label.toLowerCase())).slice(0, 4);
  const entriesByPersonne = new Map<string, RawEntry[]>();
  for (const p of PERSONNES_CATALOG) {
    entriesByPersonne.set(
      p.label,
      entries30.filter((e) => e.personnes?.includes(p.label)),
    );
  }
  const emotionPersonneHeatmap = topEmotionsForHeatmap.map((emo) => ({
    label: emo.label,
    color: emo.color,
    cells: PERSONNES_CATALOG.map((p) => {
      const bucket = entriesByPersonne.get(p.label) ?? [];
      const withEmotion = bucket.filter((e) =>
        (e.emotions ?? []).some((em) => em.label.toLowerCase() === emo.label.toLowerCase()),
      ).length;
      return {
        personne: p.label,
        pct: bucket.length > 0 ? Math.round((withEmotion / bucket.length) * 100) : 0,
      };
    }),
  }));

  // ─── Gamification ───────────────────────────────────────────────────────
  const badgeUnlockCounts = new Map<string, number>(BADGE_DEFS.map((b) => [b.id, 0]));
  for (const [, userEntries] of entriesByUser) {
    const progress = computeBadgeProgress(userEntries);
    for (const badge of BADGE_DEFS) {
      if (isBadgeUnlocked(progress, badge.id)) {
        badgeUnlockCounts.set(badge.id, (badgeUnlockCounts.get(badge.id) ?? 0) + 1);
      }
    }
  }
  const totalUsers = entriesByUser.size;
  const badgeStats = BADGE_DEFS.map((b) => ({
    ...b,
    unlockedCount: badgeUnlockCounts.get(b.id) ?? 0,
    unlockedPct: totalUsers > 0 ? Math.round(((badgeUnlockCounts.get(b.id) ?? 0) / totalUsers) * 100) : 0,
  })).sort((a, b) => b.unlockedPct - a.unlockedPct);

  const streakBuckets = [
    { label: "1-2j", min: 1, max: 2, count: 0 },
    { label: "3-6j", min: 3, max: 6, count: 0 },
    { label: "7-13j", min: 7, max: 13, count: 0 },
    { label: "14-29j", min: 14, max: 29, count: 0 },
    { label: "30-59j", min: 30, max: 59, count: 0 },
    { label: "60j+", min: 60, max: Infinity, count: 0 },
  ];
  for (const s of streakValues) {
    if (s <= 0) continue;
    const bucket = streakBuckets.find((b) => s >= b.min && s <= b.max);
    if (bucket) bucket.count++;
  }

  const leaderboard = [...streaksByUser.entries()]
    .filter(([, streak]) => streak > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, streak]) => ({
      userId,
      username: profiles.find((p) => p.id === userId)?.username ?? `Utilisatrice #${userId.slice(0, 4)}`,
      streak,
    }));

  const maxStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

  // ─── Communauté ─────────────────────────────────────────────────────────
  const tagCounts = new Map<string, number>();
  for (const e of entries30) {
    for (const tag of e.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const totalTagged = entries30.filter((e) => (e.tags?.length ?? 0) > 0).length;
  const tagDistribution = TAGS_CATALOG.map((t) => ({
    label: t.label,
    count: tagCounts.get(t.label) ?? 0,
    pct: totalTagged > 0 ? Math.round(((tagCounts.get(t.label) ?? 0) / totalTagged) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const personneCounts = new Map<string, number>();
  const lieuCounts = new Map<string, number>();
  let totalPersonneTags = 0;
  let totalLieuTags = 0;
  for (const e of entries30) {
    for (const p of e.personnes ?? []) {
      personneCounts.set(p, (personneCounts.get(p) ?? 0) + 1);
      totalPersonneTags++;
    }
    if (e.lieu) {
      lieuCounts.set(e.lieu, (lieuCounts.get(e.lieu) ?? 0) + 1);
      totalLieuTags++;
    }
  }
  const personneDistribution = PERSONNES_CATALOG.map((p) => ({
    label: p.label,
    count: personneCounts.get(p.label) ?? 0,
    pct: totalPersonneTags > 0 ? Math.round(((personneCounts.get(p.label) ?? 0) / totalPersonneTags) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
  const lieuDistribution = LIEUX_CATALOG.map((l) => ({
    label: l.label,
    count: lieuCounts.get(l.label) ?? 0,
    pct: totalLieuTags > 0 ? Math.round(((lieuCounts.get(l.label) ?? 0) / totalLieuTags) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const entriesWithPhoto = entries30.filter((e) => (e.photo_uris?.length ?? 0) > 0);
  const photoRatio = entries30.length > 0 ? Math.round((entriesWithPhoto.length / entries30.length) * 100) : 0;
  const totalPhotos = entries30.reduce((sum, e) => sum + (e.photo_uris?.length ?? 0), 0);
  const photosPerEntry = entriesWithPhoto.length > 0 ? totalPhotos / entriesWithPhoto.length : 0;

  // ─── Prompts ────────────────────────────────────────────────────────────
  // "sent" = affiché mais sans action encore enregistrée (souvent le prompt
  // du jour en cours) — exclu du taux de skip, qui ne compare que les
  // réponses tranchées (answered vs skipped).
  let totalAnswered = 0;
  let totalSkipped = 0;
  let totalPending = 0;
  const perPrompt = new Map<string, { content: string; answered: number; skipped: number }>();

  for (const row of promptHistory) {
    const content = Array.isArray(row.prompts) ? row.prompts[0]?.content : row.prompts?.content;
    if (!content) continue;

    if (row.status === "answered") totalAnswered++;
    else if (row.status === "skipped") totalSkipped++;
    else totalPending++;

    if (row.status === "answered" || row.status === "skipped") {
      const bucket = perPrompt.get(row.prompt_id) ?? { content, answered: 0, skipped: 0 };
      if (row.status === "answered") bucket.answered++;
      else bucket.skipped++;
      perPrompt.set(row.prompt_id, bucket);
    }
  }

  const totalResolved = totalAnswered + totalSkipped;

  // Catalogue complet des prompts actifs, fusionné avec leurs stats réelles
  // (0 si jamais tranché) — permet d'afficher aussi les prompts encore
  // inutilisés dans la vue "Voir tout".
  const allPromptStats = promptsCatalog
    .map((prompt) => {
      const stats = perPrompt.get(prompt.id);
      const total = (stats?.answered ?? 0) + (stats?.skipped ?? 0);
      return {
        content: prompt.content,
        views: total,
        skipPct: total > 0 ? Math.round(((stats?.skipped ?? 0) / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.views - a.views);

  const promptStats = allPromptStats.filter((p) => p.views > 0).slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      totalEntries: entries.length,
      totalEntries30: entries30.length,
      activeUsers30: activeUserIds.size,
      positiveRatio,
      avgStreak,
      rhythm,
    },
    emotions: {
      distribution: emotionDistribution,
      catalogSize: EMOTIONS_CATALOG.length,
      customTop: customEmotionsTop,
      correlationHeatmap: emotionPersonneHeatmap,
    },
    gamification: {
      badgeStats,
      streakBuckets,
      leaderboard,
      maxStreak,
      avgBadgesUnlocked:
        totalUsers > 0
          ? [...badgeUnlockCounts.values()].reduce((a, b) => a + b, 0) / totalUsers
          : 0,
    },
    community: {
      tagDistribution,
      personneDistribution,
      lieuDistribution,
      photoRatio,
      photosPerEntry,
    },
    prompts: {
      completionRate: totalResolved > 0 ? Math.round((totalAnswered / totalResolved) * 100) : 0,
      totalPending,
      activePromptsCount: promptsCatalog.length,
      topPrompts: promptStats,
      allPrompts: allPromptStats,
    },
    users: profiles.map((p) => {
      const userEntries = entriesByUser.get(p.id) ?? [];
      return {
        ...p,
        entriesCount: userEntries.length,
        streak: streaksByUser.get(p.id) ?? 0,
        lastActivity: userEntries.length > 0
          ? userEntries.reduce((max, e) => (e.created_at > max ? e.created_at : max), userEntries[0].created_at)
          : null,
      };
    }),
  };
}

export type DashboardSnapshot = Awaited<ReturnType<typeof getDashboardSnapshot>>;
