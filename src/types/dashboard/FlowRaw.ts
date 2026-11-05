import type { fetchFlowRaw } from "@/services/dashboard/fetchFlowRaw";

// "Günün axını"nın xam məlumatı (services/dashboard/fetchFlowRaw nəticəsi)
export type FlowRaw = Awaited<ReturnType<typeof fetchFlowRaw>>;
