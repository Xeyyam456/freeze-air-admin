import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type PeriodPickerProps = {
  period: Period;
  range: FuelRange;
  atEnd: boolean;
  onPeriod: (p: Period) => void;
  onShift: (dir: 1 | -1) => void;
};
