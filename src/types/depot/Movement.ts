import type { Tables } from "@/types/database";

// Depo jurnalının bir hərəkəti (stock_movements + kimin adı)
export type Movement = Tables<"stock_movements"> & { employees: { full_name: string } | null };
