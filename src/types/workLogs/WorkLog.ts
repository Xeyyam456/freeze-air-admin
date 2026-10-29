import type { fetchLogs } from "@/services/workLogs/fetchLogs";

// Görülən iş (usta, yer, fayl növləri ilə)
export type WorkLog = Awaited<ReturnType<typeof fetchLogs>>[number];
