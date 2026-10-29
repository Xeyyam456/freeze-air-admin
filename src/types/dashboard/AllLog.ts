import type { fetchAllLogs } from "@/services/dashboard/fetchAllLogs";

// Bütün iş qeydləri pəncərəsinin sətri
export type AllLog = Awaited<ReturnType<typeof fetchAllLogs>>[number];
