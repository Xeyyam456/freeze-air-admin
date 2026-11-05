import type { FlowLaneKey } from "./FlowLaneKey";

// Bir hadisə: an (at) və ya müddət (at → end); end yoxdursa və ongoing-dirsə "indi"yə qədər davam edir
export type FlowEvent = {
  id: string;
  lane: FlowLaneKey;
  at: string;
  end?: string | null;
  ongoing?: boolean;
  pending?: boolean; // cavab gözləyir (baxılmamış müraciət, təsdiqlənməmiş icazə)
  title: string;
  logId?: number; // görülən iş: kliklə iş pəncərəsi açılır
};
