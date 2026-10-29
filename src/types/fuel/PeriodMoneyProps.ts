import type { CarSummary } from "./CarSummary";
import type { FuelRange } from "./FuelRange";
import type { Period } from "./Period";

export type PeriodMoneyProps = { sel: CarSummary; period: Period; range: FuelRange; monthR: FuelRange; onPay: () => void };
