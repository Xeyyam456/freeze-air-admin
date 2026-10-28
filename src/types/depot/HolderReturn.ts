import type { useHolderReturn } from "@/pages/Depot/hooks/useHolderReturn";

// Ustadakını geri alma / təhvil vəziyyəti (HolderRow → SettleForm)
export type HolderReturn = ReturnType<typeof useHolderReturn>;
