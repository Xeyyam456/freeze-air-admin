import type { useRequestDecision } from "@/pages/Depot/hooks/useRequestDecision";

// Gözləyən sənədin vəziyyəti (RequestRow → RequestEdit, RequestReject)
export type RequestDecision = ReturnType<typeof useRequestDecision>;
