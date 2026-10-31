import type { StoreInput } from "@/types/clients";

export type ImportRow = StoreInput & { line: number; error?: string };
