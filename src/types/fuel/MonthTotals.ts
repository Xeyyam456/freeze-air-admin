import type { DayCover } from "./DayCover";

// Ayın sərfi, verilən pul ("Almadığını deyir" sayılmır) və günlərin ödəniş örtüyü (aylıq balans və "Verildi" sütunu üçün)
export type MonthTotals = { cost: number; paid: number; cover: Record<string, DayCover> };
