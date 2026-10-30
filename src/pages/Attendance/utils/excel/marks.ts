import type { DayStatus } from "@/types/attendance";
import { MUTED, OK, RED, SLATE, VIOLET } from "./style";

// Gün-gün cədvəlində xana: işarə və rəng
export const MARK: Record<DayStatus, { v: string; bg?: string; color?: string }> = {
  present: { v: "✓", bg: "#dcfce7", color: OK },
  leave: { v: "İ", bg: "#ede9fe", color: VIOLET },
  absent: { v: "X", bg: "#fee2e2", color: RED },
  off: { v: "B", bg: "#e2e8f0", color: SLATE },
  pending: { v: "", bg: "#ffffff" },
  future: { v: "" },
  before: { v: "" },
};

export const STATUS_TEXT: Record<DayStatus, { v: string; color: string }> = {
  present: { v: "İşdə", color: OK },
  leave: { v: "İcazəli", color: VIOLET },
  absent: { v: "Gəlmədi", color: RED },
  off: { v: "Bazar (istirahət)", color: SLATE },
  pending: { v: "Hələ gəlməyib", color: MUTED },
  future: { v: "", color: MUTED },
  before: { v: "Qeyd yoxdur", color: MUTED },
};
