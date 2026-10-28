import type { Tables } from "@/types/database";

// Təsdiq gözləyən sənəd (mədaxil, qaytarma, silinmə, sayım, istək)
export type DepotRequest = Tables<"depot_requests">;
