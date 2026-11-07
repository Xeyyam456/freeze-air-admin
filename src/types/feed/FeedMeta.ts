import type { Reaction } from "./Reaction";

// Lent kartlarının əlavə məlumatı (iş qeydi id-sinə görə): reaksiyalar, şərh sayı, birlikdə işləyənlər
export type FeedMeta = {
  reactions: Map<number, { up: number; down: number; mine: Reaction | null }>;
  comments: Map<number, number>;
  partners: Map<number, string[]>;
};
