import { useData } from "@/lib/useData";
import { fetchLocationLog } from "@/services/clients/fetchLocationLog";
import type { LocationUnit } from "@/types/clients";

export const LOCATION_LOG_KEY = "location-log";

export const useLocationLog = (companyId: number, units: LocationUnit[]) =>
  useData(LOCATION_LOG_KEY, () => fetchLocationLog(companyId, units), [companyId, units.map((u) => u.id).join()]);
