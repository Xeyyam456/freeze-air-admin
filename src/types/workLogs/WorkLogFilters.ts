import type { fetchFilters } from "@/services/workLogs/fetchLogs";

// Süzgəc siyahıları: ustalar, şirkət/marketlər
export type WorkLogFilters = Awaited<ReturnType<typeof fetchFilters>>;
