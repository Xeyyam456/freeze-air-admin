import { useData } from "@/lib/useData";
import { fetchClients } from "@/services/clients/fetchClients";
import type { Kind } from "@/types/clients";

// Açarlar lib/revalidate.ts → LIVE xəritəsindədir
export const CLIENTS_KEY = "clients";

export const useClientsData = (kind: Kind) => useData(CLIENTS_KEY, () => fetchClients(kind), [kind]);
