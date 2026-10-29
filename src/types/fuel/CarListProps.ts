import type { CarSummary } from "./CarSummary";
import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type CarListProps = {
  cars: CarSummary[];
  selId: number | undefined;
  open: number | null;
  paysOpen: number | null;
  period: Period;
  range: FuelRange;
  today: string;
  onPick: (id: number) => void;
  onToggle: (id: number) => void;
  onTogglePays: (id: number) => void;
};
