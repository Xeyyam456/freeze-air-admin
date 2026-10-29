import type { FuelPayment } from "./FuelPayment";

export type PaymentsListProps = { payments: FuelPayment[]; paid: number; open: boolean; onToggle: () => void };
