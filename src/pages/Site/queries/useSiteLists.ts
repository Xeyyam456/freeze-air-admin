import { useData } from "@/lib/useData";
import { fetchSorted } from "@/services/site/fetchSite";

// Sayt məzmunu siyahıları (sıra və id ilə sıralanmış); açarlar köhnə ilə eynidir
export const useSegments = () => useData("site-segments", () => fetchSorted("site_segments"));
export const useEquipmentList = () => useData("site-equipment", () => fetchSorted("site_equipment"));
export const useServices = () => useData("site-services", () => fetchSorted("site_services"));
