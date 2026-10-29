import type { MonthStats } from "./MonthStats";

export type DaysPanelProps = { y: number; m: number; s: MonthStats; todayDay: number | null; cumulative: boolean };
