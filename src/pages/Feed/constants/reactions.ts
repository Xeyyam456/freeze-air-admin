import type { Reaction } from "@/types/feed";

// Lent reaksiyaları (seçim pəncərəsində və kartda bu sırada): bazadakı kind → emoji + ad
export const REACTIONS: { kind: Reaction; emoji: string; label: string }[] = [
  { kind: "up", emoji: "👍", label: "Bəyən" },
  { kind: "down", emoji: "👎", label: "Bəyənmə" },
  { kind: "heart", emoji: "❤️", label: "Sevdim" },
  { kind: "clap", emoji: "👏", label: "Əhsən" },
  { kind: "pray", emoji: "🙏", label: "Sağ ol" },
];

export const REACTION_EMOJI = Object.fromEntries(REACTIONS.map((r) => [r.kind, r.emoji])) as Record<Reaction, string>;
export const isReaction = (v: string): v is Reaction => v in REACTION_EMOJI;
