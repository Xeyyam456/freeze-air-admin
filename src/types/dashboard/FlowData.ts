import type { FlowEvent } from "./FlowEvent";

// Seçilmiş günün hadisələri + son 14 günün hər zolaq üzrə sayı (days[0] = 13 gün əvvəl, days[13] = seçilmiş gün)
export type FlowData = { events: FlowEvent[]; days: string[]; pulse: Record<string, number[]> };
