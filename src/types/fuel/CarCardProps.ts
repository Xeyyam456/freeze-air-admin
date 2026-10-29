import type { CarSummary } from "./CarSummary";
import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type CarCardProps = {
  item: CarSummary;
  selected: boolean;
  expanded: boolean;
  paysOpen: boolean;
  period: Period;
  range: FuelRange;
  today: string;
  onPick: () => void;
  onToggle: () => void;
  onTogglePays: () => void;
};
