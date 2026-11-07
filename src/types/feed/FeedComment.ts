import type { Reaction, ReactionCounts } from "./Reaction";

// Şərh: müəllif, mətn, vaxt + şərhə verilən reaksiyalar (növ üzrə say) və mənim reaksiyam
export type FeedComment = { id: number; employeeId: number; name: string; photo: string | null; body: string; at: string; reactions: ReactionCounts; mine: Reaction | null };
