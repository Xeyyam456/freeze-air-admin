import { MONTHS_AZ } from "@/shared/utils/monthsAz";

// Tarix köməkçiləri ("YYYY-MM-DD", UTC günorta ilə: saat qurşağı sürüşməsin); admin və web Yanacaq səhifələri
export const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const isoOf = (d: Date) => d.toISOString().slice(0, 10);
export function addDays(iso: string, n: number) { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); }
export function addMonths(iso: string, n: number) { const d = d12(`${iso.slice(0, 7)}-01`); d.setUTCMonth(d.getUTCMonth() + n); return isoOf(d); }
// 2026-10-25 → 25.10.2026 (cədvəllərdə kiçik yazılır)
export const numDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
export const dayName = (iso: string) => `${Number(iso.slice(8))} ${MONTHS_AZ[Number(iso.slice(5, 7)) - 1]}`;
export const WEEKDAY_SHORT = ["Baz", "B.e", "Ç.a", "Çər", "C.a", "Cüm", "Şən"];
export const timeBaku = (iso: string) =>
  new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
