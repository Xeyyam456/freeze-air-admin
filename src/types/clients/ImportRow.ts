import type { StoreInput } from "@/actions/stores";

export type ImportRow = StoreInput & { line: number; error?: string };
