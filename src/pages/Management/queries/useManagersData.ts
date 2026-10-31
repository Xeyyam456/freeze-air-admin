import { useData } from "@/lib/useData";
import { fetchManagers } from "@/services/management/fetchManagers";

export const MANAGERS_KEY = "management";

export const useManagersData = (admin: boolean) => useData(MANAGERS_KEY, () => fetchManagers(admin), [admin]);
