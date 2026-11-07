import type { Reaction } from "./Reaction";

// Reaksiya verən usta/rəhbər (siyahı pəncərəsi)
export type FeedLiker = { id: number; name: string; photo: string | null; role: string; kind: Reaction };
