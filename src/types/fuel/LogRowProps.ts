import type { FuelPayment } from "./FuelPayment";
import type { MileageRow } from "./MileageRow";

export type LogRowProps = { l: MileageRow; payments: FuelPayment[]; today: string };
