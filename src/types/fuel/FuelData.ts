import type { FuelCar } from "./FuelCar";
import type { FuelPayment } from "./FuelPayment";
import type { FuelPrices } from "./FuelPrices";
import type { MileageRow } from "./MileageRow";
import type { MonthTotals } from "./MonthTotals";

// Yanacaq səhifəsinin bütün məlumatı; month: usta → ayın sərfi və verilən
export type FuelData = {
  cars: FuelCar[];
  logs: MileageRow[];
  todayLogs: MileageRow[];
  payments: FuelPayment[];
  month: Map<number, MonthTotals>;
  prices: FuelPrices;
};
