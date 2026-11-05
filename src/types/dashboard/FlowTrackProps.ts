import type { FlowEvent } from "./FlowEvent";

export type FlowTrackProps = { events: FlowEvent[]; range: [number, number]; day: string; now: number | null; onOpenLog: (id: number) => void };
