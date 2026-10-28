import { useData } from "@/lib/useData";
import { fetchDepot } from "@/services/depot/fetchDepot";
import { DEPOT_KEY } from "./keys";

export const useDepotData = () => useData(DEPOT_KEY, fetchDepot);
