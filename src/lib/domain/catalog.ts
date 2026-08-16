// Portage des catalogues statiques de l'app mobile (arira/constants/*.ts).
// Gardés synchronisés à la main — pas de dépendance directe entre les deux
// repos (projets séparés, cf. arira-dashboard/README ou mémoire du projet).

export interface EmotionDef {
  id: string;
  label: string;
  emoji: string;
}

export const EMOTIONS_CATALOG: EmotionDef[] = [
  { id: "joie", label: "Joie", emoji: "😊" },
  { id: "tristesse", label: "Tristesse", emoji: "😢" },
  { id: "colere", label: "Colère", emoji: "😠" },
  { id: "peur", label: "Peur", emoji: "😨" },
  { id: "surprise", label: "Surprise", emoji: "😮" },
  { id: "degout", label: "Dégoût", emoji: "🤢" },
  { id: "fierte", label: "Fierté", emoji: "🦊" },
  { id: "serenite", label: "Sérénité", emoji: "🧘" },
  { id: "gratitude", label: "Gratitude", emoji: "🙏" },
  { id: "anxiete", label: "Anxiété", emoji: "😰" },
  { id: "confiance", label: "Confiance", emoji: "🤝" },
  { id: "amour", label: "Amour", emoji: "❤️" },
];

export const EMOTION_COLORS: Record<string, string> = {
  joie: "#F4C842",
  tristesse: "#5B8FD4",
  colere: "#E05C3A",
  "colère": "#E05C3A",
  peur: "#8B6FD4",
  surprise: "#F4942A",
  degout: "#6BAF6B",
  "dégoût": "#6BAF6B",
  fierte: "#D4A843",
  "fierté": "#D4A843",
  serenite: "#5DCAA5",
  "sérénité": "#5DCAA5",
  gratitude: "#A78BFA",
  anxiete: "#F97316",
  "anxiété": "#F97316",
  confiance: "#3B82F6",
  amour: "#EF4444",
};

const FALLBACK_PALETTE = [
  "#6BAF6B", "#D4A843", "#5DCAA5", "#A78BFA", "#F97316",
  "#3B82F6", "#EF4444", "#F4C842", "#5B8FD4", "#E05C3A", "#8B6FD4", "#F4942A",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getEmotionColor(label: string): string {
  const key = label.toLowerCase();
  if (EMOTION_COLORS[key]) return EMOTION_COLORS[key];
  return FALLBACK_PALETTE[hashString(key) % FALLBACK_PALETTE.length];
}

export const POSITIVE_EMOTIONS = new Set([
  "joie", "fierté", "fierte", "sérénité", "serenite",
  "gratitude", "confiance", "amour", "surprise",
]);

export interface TagDef {
  id: string;
  label: string;
}

export const TAGS_CATALOG: TagDef[] = [
  { id: "souvenir-marquant", label: "Souvenir marquant" },
  { id: "moment-fort", label: "Moment fort" },
  { id: "inattendu", label: "Inattendu" },
  { id: "jai-grandi", label: "J'ai grandi" },
  { id: "javance", label: "J'avance" },
  { id: "reconnaissance", label: "Reconnaissance" },
  { id: "prise-de-conscience", label: "Prise de conscience" },
];

export interface PersonneDef {
  id: string;
  label: string;
  emoji: string;
}

export const PERSONNES_CATALOG: PersonneDef[] = [
  { id: "seul", label: "Seul", emoji: "🧍" },
  { id: "amis", label: "Amis", emoji: "👥" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧" },
  { id: "partenaire", label: "Partenaire", emoji: "🤝" },
];

export interface LieuDef {
  id: string;
  label: string;
}

export const LIEUX_CATALOG: LieuDef[] = [
  { id: "maison", label: "Maison" },
  { id: "ecoles", label: "Écoles" },
  { id: "universite", label: "Université" },
  { id: "travail", label: "Travail" },
  { id: "loisir", label: "Loisir" },
];

export type BadgeCategory = "Progression" | "Découverte" | "Gratitude" | "Croissance";

export interface BadgeDef {
  id: string;
  name: string;
  category: BadgeCategory;
  target: number;
}

// Portage de arira/constants/badges.ts, sans le champ `image` (React Native only).
export const BADGE_DEFS: BadgeDef[] = [
  { id: "premier-pas", name: "Premier pas", category: "Progression", target: 1 },
  { id: "premieres-pages", name: "Premières pages", category: "Progression", target: 3 },
  { id: "histoire-commence", name: "L'histoire commence", category: "Progression", target: 10 },
  { id: "habitude-en-construction", name: "Habitude en construction", category: "Progression", target: 20 },
  { id: "journal-en-marche", name: "Journal en marche", category: "Progression", target: 50 },
  { id: "collection-vivante", name: "Collection vivante", category: "Progression", target: 100 },
  { id: "memoire-en-construction", name: "Mémoire en construction", category: "Progression", target: 200 },
  { id: "annee-histoires", name: "Une année d'histoires", category: "Progression", target: 365 },
  { id: "gardien-souvenirs", name: "Gardien des souvenirs", category: "Progression", target: 500 },
  { id: "maitre-journal", name: "Maître du journal", category: "Progression", target: 1000 },
  { id: "premier-cliche", name: "Premier cliché", category: "Découverte", target: 1 },
  { id: "album-en-construction", name: "Album en construction", category: "Découverte", target: 5 },
  { id: "emotion-nommee", name: "Une émotion nommée", category: "Découverte", target: 1 },
  { id: "palette-emotions", name: "Palette d'émotions", category: "Découverte", target: 5 },
  { id: "explorateur-emotionnel", name: "Explorateur émotionnel", category: "Découverte", target: 10 },
  { id: "premier-souvenir-marquant", name: "Premier souvenir marquant", category: "Découverte", target: 1 },
  { id: "prise-de-conscience", name: "Une prise de conscience", category: "Découverte", target: 1 },
  { id: "javance", name: "J'avance", category: "Découverte", target: 1 },
  { id: "reconnaissance", name: "Reconnaissance", category: "Gratitude", target: 1 },
  { id: "regard-attentif", name: "Regard attentif", category: "Gratitude", target: 5 },
  { id: "collection-gratitude", name: "Collection de gratitude", category: "Gratitude", target: 20 },
  { id: "petite-victoire", name: "Une petite victoire", category: "Croissance", target: 1 },
  { id: "croissance", name: "Croissance", category: "Croissance", target: 10 },
];
