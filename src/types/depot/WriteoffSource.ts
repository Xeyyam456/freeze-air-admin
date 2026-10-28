import type { Holding, Piece } from "@/types/depot";

export type WriteoffSource = { kind: "depot" } | { kind: "piece"; piece: Piece } | { kind: "holding"; holding: Holding };
