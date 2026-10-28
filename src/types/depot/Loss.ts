import type { DepotRequest } from "./DepotRequest";

// Təsdiqlənmiş silinmə (itki): siyahıda "1 xarab olub", hamısı gedibsə vəziyyət "Xarab olub"
export type Loss = Pick<DepotRequest, "tool_id" | "quantity" | "reason" | "note" | "decided_at">;
