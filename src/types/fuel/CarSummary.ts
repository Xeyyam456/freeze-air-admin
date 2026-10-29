import type { FuelCar } from "./FuelCar";
import type { FuelPayment } from "./FuelPayment";
import type { FuelTotals } from "./FuelTotals";
import type { MileageRow } from "./MileageRow";
import type { MonthTotals } from "./MonthTotals";

// Bir maşının dövr üzrə xülasəsi; balance: AYIN balansı (ayda verilən − ayda sərf)
export type CarSummary = {
  car: FuelCar;
  logs: MileageRow[];
  total: FuelTotals;
  payments: FuelPayment[];
  paid: number;
  month: MonthTotals;
  balance: number;
  today: MileageRow | undefined;
};
