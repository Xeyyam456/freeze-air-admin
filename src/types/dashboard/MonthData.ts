import type { Master } from "./Master";
import type { MonthLogRow } from "./MonthLogRow";

// key: "il-ay" (köhnə ay yeni gələnə qədər qalır); prevCount: əvvəlki ayın tam iş sayı
export type MonthData = { key: string; logs: MonthLogRow[]; groups: Map<number, string>; prevCount: number; masters: Master[] };
