import { WEEKDAY } from "../constants/calendar";

// "21.10.2026"
export const fullDate = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}.${d.slice(0, 4)}`;

// Həftənin günü (0 = bazar)
export const weekdayNo = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay();

export const weekdayName = (d: string) => WEEKDAY[weekdayNo(d)];
