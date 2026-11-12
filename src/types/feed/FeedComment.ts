import type { Reaction, ReactionCounts } from "./Reaction";

// Şərh: müəllif, mətn, vaxt + şərhə verilən reaksiyalar (növ üzrə say) və mənim reaksiyam
export type FeedComment = { id: number; employeeId: number; name: string; photo: string | null; body: string; at: string; reactions: ReactionCounts; mine: Reaction | null; audio?: FeedAudio | null };

// Səs şərhi: storage `feed-audio` yolu, müddət (ms), dalğa zolağı (0..100)
export type FeedAudio = { path: string; ms: number; peaks: number[]; local?: string }; // local = göndərilərkən brauzerdəki fayl (optimistik oxutma)

// Yazılmış səs: fayl (blob), müddət (ms), dalğa zolağı, format
export type VoiceResult = { blob: Blob; ms: number; peaks: number[]; mime: string };
