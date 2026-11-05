import type { LucideIcon } from "lucide-react";

// Kartın "…" menyusunun bəndi: seçim (active ilə işarəli) və ya əməliyyat; section — bəndin üstündəki qrup adı
export type CardMenuItem = { label: string; icon?: LucideIcon; active?: boolean; section?: string; onSelect: () => void };
