import type { DayCover } from "./DayCover";
import type { FuelPayment } from "./FuelPayment";

// Bir günün ödənişləri (artıq günə görə süzülmüş) və ayın pullarından həmin günə düşən
export type DayPaysProps = { payments: FuelPayment[]; cover: DayCover | undefined };
