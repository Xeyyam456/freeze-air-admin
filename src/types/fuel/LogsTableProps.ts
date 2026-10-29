import type { FuelPayment } from "./FuelPayment";
import type { FuelRange } from "./FuelRange";
import type { FuelTotals } from "./FuelTotals";
import type { MileageRow } from "./MileageRow";

export type LogsTableProps = { logs: MileageRow[]; payments: FuelPayment[]; total: FuelTotals; paid: number; range: FuelRange; today: string };
