import type { DayStatus } from "./DayStatus";
import type { Presence } from "./Presence";

export type DayEntry = { day: string; status: DayStatus; presence: Presence | null };
