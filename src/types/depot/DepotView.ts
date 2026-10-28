import type { DepotTab } from "@/types/depot/DepotTab";

// "home": ümumi baxış (depo açılanda ilk bu görünür), sonra seçilən siyahı
export type DepotView = DepotTab | "home";
