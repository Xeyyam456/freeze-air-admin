import type { WorkLog } from "./WorkLog";

// Gündə: tək iş sətri və ya eyni üzvlü qrup işləri (bir açılan sətir)
export type LogEntry = { type: "solo"; log: WorkLog } | { type: "crew"; key: string; names: string; logs: WorkLog[] };
