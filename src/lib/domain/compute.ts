import { BADGE_DEFS, POSITIVE_EMOTIONS } from "./catalog";

// Ligne brute de journal_entries, telle que renvoyée par Supabase.
export interface RawEntry {
  id: string;
  user_id: string;
  emotions: { label: string; emoji?: string }[] | null;
  tags: string[] | null;
  personnes: string[] | null;
  lieu: string | null;
  photo_uris: string[] | null;
  created_at: string;
}

// Portage de computeStreak() (arira/lib/hooks/useProfile.ts) — le streak ne
// démarre que si la dernière entrée date d'aujourd'hui ou d'hier.
export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const unique = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort((a, b) =>
    b.localeCompare(a),
  );

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// Portage de computeBadges() (arira/lib/hooks/useRecap.ts) — calcule la
// progression courante de chaque badge pour un lot d'entrées (un utilisateur).
export function computeBadgeProgress(entries: RawEntry[]): Record<string, number> {
  const total = entries.length;
  const photoEntriesCount = entries.filter((e) => (e.photo_uris?.length ?? 0) > 0).length;
  const emotionEntriesCount = entries.filter((e) => (e.emotions?.length ?? 0) > 0).length;
  const distinctEmotionsCount = new Set(
    entries.flatMap((e) => (e.emotions ?? []).map((em) => em.label.toLowerCase())),
  ).size;
  const souvenirMarquantCount = entries.filter((e) => e.tags?.includes("Souvenir marquant")).length;
  const priseDeConscienceCount = entries.filter((e) => e.tags?.includes("Prise de conscience")).length;
  const avanceCount = entries.filter((e) => e.tags?.includes("J'avance")).length;
  const grandiCount = entries.filter((e) => e.tags?.includes("J'ai grandi")).length;
  const petiteVictoireCount = entries.filter(
    (e) => e.tags?.includes("J'avance") || e.tags?.includes("J'ai grandi"),
  ).length;
  const gratitudeCount = entries.filter(
    (e) =>
      e.tags?.includes("Reconnaissance") ||
      (e.emotions ?? []).some((em) => em.label.toLowerCase() === "gratitude"),
  ).length;

  return {
    "premier-pas": total,
    "premieres-pages": total,
    "histoire-commence": total,
    "habitude-en-construction": total,
    "journal-en-marche": total,
    "collection-vivante": total,
    "memoire-en-construction": total,
    "annee-histoires": total,
    "gardien-souvenirs": total,
    "maitre-journal": total,
    "premier-cliche": photoEntriesCount,
    "album-en-construction": photoEntriesCount,
    "emotion-nommee": emotionEntriesCount,
    "palette-emotions": distinctEmotionsCount,
    "explorateur-emotionnel": distinctEmotionsCount,
    "premier-souvenir-marquant": souvenirMarquantCount,
    "prise-de-conscience": priseDeConscienceCount,
    javance: avanceCount,
    reconnaissance: gratitudeCount,
    "regard-attentif": gratitudeCount,
    "collection-gratitude": gratitudeCount,
    "petite-victoire": petiteVictoireCount,
    croissance: grandiCount,
  };
}

export function isBadgeUnlocked(progress: Record<string, number>, badgeId: string): boolean {
  const def = BADGE_DEFS.find((b) => b.id === badgeId);
  if (!def) return false;
  return (progress[badgeId] ?? 0) >= def.target;
}

export function isPositiveEmotion(label: string): boolean {
  return POSITIVE_EMOTIONS.has(label.toLowerCase());
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}
