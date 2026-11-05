import type { FlowEvent } from "./FlowEvent";
import type { FlowLaneMeta } from "./FlowLaneMeta";

export type FlowLaneProps = {
  meta: FlowLaneMeta;
  events: FlowEvent[];
  pulse: number[];
  days: string[];
  range: [number, number];
  day: string;
  now: number | null;
  onOpenLog: (id: number) => void;
};
