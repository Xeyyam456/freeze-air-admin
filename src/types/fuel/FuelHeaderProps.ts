import type { CarSummary } from "./CarSummary";
import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type FuelHeaderProps = {
  sel: CarSummary | null;
  today: string;
  period: Period;
  range: FuelRange;
  monthR: FuelRange;
  atEnd: boolean;
  onPeriod: (p: Period) => void;
  onShift: (dir: 1 | -1) => void;
  onPay: (c: CarSummary) => void;
};
