import type { CalendarView } from "./CalendarView";

export type CalendarProps = {
  view: CalendarView;
  value: string;
  min?: string;
  max?: string;
  required?: boolean;
  onShift: (delta: number) => void;
  onPick: (v: string) => void;
};
