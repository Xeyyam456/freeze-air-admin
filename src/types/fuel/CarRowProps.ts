import type { CarSummary } from "./CarSummary";
import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type CarRowProps = { item: CarSummary; period: Period; range: FuelRange; expanded: boolean; onPick: () => void; onToggle: () => void };
