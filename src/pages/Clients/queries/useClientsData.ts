import { useData } from "@/lib/useData";
import type { Kind } from "@/lib/kinds";
import { fetchClients } from "@/services/clients/fetchClients";

// Açarlar lib/revalidate.ts → LIVE xəritəsindədir
export const CLIENTS_KEY = "clients";

export const useClientsData = (kind: Kind) => useData(CLIENTS_KEY, () => fetchClients(kind), [kind]);
