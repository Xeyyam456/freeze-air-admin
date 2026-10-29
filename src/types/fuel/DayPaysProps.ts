import type { FuelPayment } from "./FuelPayment";

// Bir günün ödənişləri (artıq günə görə süzülmüş)
export type DayPaysProps = { payments: FuelPayment[] };
