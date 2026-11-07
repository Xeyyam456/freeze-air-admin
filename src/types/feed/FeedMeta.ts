import type { Reaction, ReactionCounts } from "./Reaction";

// Lent kartlarının əlavə məlumatı (iş qeydi id-sinə görə): reaksiyalar, şərh sayı, birlikdə işləyənlər
export type FeedMeta = {
  reactions: Map<number, { counts: ReactionCounts; mine: Reaction | null }>;
  comments: Map<number, number>;
  partners: Map<number, string[]>;
};
