import type { fetchPanelExtras } from "@/services/dashboard/fetchPanelExtras";

// Panel dashboard-unun əlavə xam məlumatı
export type PanelExtras = Awaited<ReturnType<typeof fetchPanelExtras>>;
