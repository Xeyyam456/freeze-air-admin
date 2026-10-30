import type { Session } from "./Session";

export type Presence = { in: string; out: string | null; sessions: Session[]; minutes: number };
